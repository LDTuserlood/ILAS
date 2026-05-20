import os
import time
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from ai.context_builder import build_context, build_context_sources
from ai.retrieval_level6 import retrieve_multi_source

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower().strip()

if AI_PROVIDER == "groq":
    from ai.groq_service import guarded_completion, rewrite_contextual_query
    _ACTIVE_PROVIDER = "Groq"
else:
    from ai.gemini_service import guarded_completion, rewrite_contextual_query
    _ACTIVE_PROVIDER = "Gemini"


NO_ILAS_CONTEXT_ANSWER = (
    "Rất tiếc, theo dữ liệu hiện tại của hệ thống ILAS, "
    "tôi chưa tìm thấy quy định cụ thể phù hợp với câu hỏi này để hỗ trợ bạn."
)


FOLLOW_UP_MARKERS = [
    "vay", "vậy", "the", "thế", "do", "đó", "nay", "này",
    "truong hop", "trường hợp", "neu", "nếu", "con", "còn",
    "tiep", "tiếp", "nhu vay", "như vậy", "dieu do", "điều đó",
    "khoan do", "khoản đó", "co lay", "có lây", "nhu nao", "như nào",
]


def _format_history(history, limit=4):
    if not isinstance(history, list):
        return ""

    lines = []
    for item in history[-limit:]:
        if not isinstance(item, dict):
            continue

        question = str(item.get("question") or "").strip()
        answer = str(item.get("answer") or "").strip()
        context_used = str(item.get("contextUsed") or "").strip()

        if context_used:
            lines.append(f"Ngữ cảnh luật đã dùng: {context_used}")
        if question:
            lines.append(f"Người dùng: {question}")
        if answer:
            lines.append(f"AI: {answer[:1200]}")

    return "\n".join(lines).strip()


def _looks_like_follow_up(query):
    q = (query or "").lower().strip()
    if not q:
        return False
    if len(q.split()) <= 10:
        return True
    return any(marker in q for marker in FOLLOW_UP_MARKERS)


def _clean_rewritten_query(value):
    if not isinstance(value, str):
        return ""

    text = value.strip()
    prefixes = [
        "Câu truy vấn:",
        "Truy vấn:",
        "Câu hỏi độc lập:",
        "Rewritten query:",
        "Search query:",
    ]
    for prefix in prefixes:
        if text.lower().startswith(prefix.lower()):
            text = text[len(prefix):].strip()

    text = text.strip().strip('"').strip("'").strip()
    return " ".join(text.split())


def _is_bad_rewrite(value):
    if not isinstance(value, str) or not value.strip():
        return True

    text = value.lower()
    bad_markers = [
        "api_key",
        "json error",
        "không trả về",
        "khong tra ve",
        "đang gặp",
        "dang gap",
        "gặp lỗi",
        "gap loi",
        "quá tải",
        "qua tai",
    ]
    return any(marker in text for marker in bad_markers)


def _build_retrieval_query(query, history):
    history_text = _format_history(history, limit=3)
    deterministic = expand_natural_search_query(query)
    if deterministic:
        print("CHAT ORIGINAL QUERY:", query)
        print("CHAT INDEPENDENT QUERY:", deterministic)
        return deterministic

    if not history_text:
        return query

    if not _looks_like_follow_up(query):
        return query

    try:
        rewritten = rewrite_contextual_query(
            current_question=query,
            conversation_context=history_text,
        )
        rewritten = _clean_rewritten_query(rewritten)
        if not _is_bad_rewrite(rewritten):
            print("ORIGINAL QUERY:", query)
            print("REWRITTEN QUERY:", rewritten)
            return rewritten
    except Exception as rewrite_error:
        print("CONTEXTUAL QUERY REWRITE ERROR:", repr(rewrite_error))

    return (
        "Câu hỏi có thể là câu hỏi nối tiếp trong hội thoại. "
        "Hãy tìm quy định pháp luật phù hợp dựa trên lịch sử và câu hỏi mới.\n\n"
        f"LỊCH SỬ GẦN NHẤT:\n{history_text}\n\n"
        f"CÂU HỎI MỚI:\n{query}"
    )


def build_natural_search_query(query: str) -> str:
    if not query or not query.strip():
        return ""

    deterministic = expand_natural_search_query(query)
    if deterministic:
        print("NATURAL SEARCH ORIGINAL QUERY:", query)
        print("NATURAL SEARCH DETERMINISTIC QUERY:", deterministic)
        return deterministic

    search_context = (
        "Người dùng đang tra cứu pháp luật bằng ngôn ngữ tự nhiên. "
        "Hãy chuyển mô tả tình huống đời thường thành truy vấn pháp lý độc lập, "
        "bổ sung thuật ngữ pháp lý phù hợp để tìm đúng văn bản và điều luật."
    )

    try:
        rewritten = rewrite_contextual_query(
            current_question=query,
            conversation_context=search_context,
        )
        rewritten = _clean_rewritten_query(rewritten)
        if not _is_bad_rewrite(rewritten):
            print("NATURAL SEARCH ORIGINAL QUERY:", query)
            print("NATURAL SEARCH REWRITTEN QUERY:", rewritten)
            return rewritten
    except Exception as rewrite_error:
        print("NATURAL SEARCH REWRITE ERROR:", repr(rewrite_error))

    return query.strip()


def expand_natural_search_query(query: str) -> str:
    from ai.retrieval_level6 import normalize_text

    q = normalize_text(query)
    hints = []

    def has_any(words):
        return any(word in q for word in words)

    specific_labor_topic = has_any([
        "tai nan lao dong", "an toan lao dong", "ve sinh lao dong",
        "bao hiem xa hoi", "bhxh", "bao hiem that nghiep", "tro cap that nghiep",
        "cong doan", "nuoc ngoai", "xuat khau lao dong", "di lam viec o nuoc ngoai",
    ])

    # Lao động trong nước: tránh nhầm sang luật người lao động đi nước ngoài
    # và tránh lấn át các luật chuyên ngành như an toàn lao động/BHXH/Công đoàn.
    if (
        has_any(["cong ty", "nhan vien", "nguoi lao dong", "sep", "chu lao dong"])
        or has_any(["luong", "giu luong", "nghi viec", "sa thai", "thu viec", "bao truoc"])
    ) and not specific_labor_topic:
        hints.append(
            "Bộ luật Lao động 2019 hợp đồng lao động tiền lương trả lương "
            "chấm dứt hợp đồng lao động nghỉ việc người lao động người sử dụng lao động "
            "trách nhiệm thanh toán tiền lương"
        )

    if has_any(["bao hiem xa hoi", "bhxh", "bao hiem that nghiep", "tro cap that nghiep"]):
        hints.append("Luật Bảo hiểm xã hội Luật Việc làm bảo hiểm thất nghiệp chế độ bảo hiểm người lao động")

    if has_any(["tai nan lao dong", "an toan lao dong", "ve sinh lao dong"]):
        hints.append("Luật An toàn vệ sinh lao động tai nạn lao động trách nhiệm người sử dụng lao động")

    if has_any(["cong doan", "tham gia cong doan"]):
        hints.append("Luật Công đoàn quyền công đoàn bảo vệ người lao động")

    if has_any(["nuoc ngoai", "xuat khau lao dong", "moi gioi lao dong"]):
        hints.append("Luật Người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng")

    if has_any(["bi danh", "danh toi", "danh nguoi", "hanh hung", "gay thuong tich", "thuong tich", "tac dong vat ly", "de doa giet", "xam hai suc khoe", "co y gay thuong tich", "tat toi", "tat vao", "bi tat", "chi tat", "tat nhung", "xo xat"]):
        hints.append("Bo luat Hinh su toi co y gay thuong tich xam pham suc khoe tinh mang danh du nhan pham")
        hints.append("Luat Xu ly vi pham hanh chinh hanh vi xam hai suc khoe nguoi khac danh tat chua gay thuong tich")
        hints.append("Bộ luật Hình sự tội cố ý gây thương tích xâm phạm sức khỏe tính mạng danh dự nhân phẩm")

    if has_any(["boi thuong", "den bu", "thiet hai suc khoe", "yeu cau boi thuong"]):
        hints.append("Bo luat Dan su boi thuong thiet hai do suc khoe bi xam pham")

    if has_any(["tong xe", "tai nan giao thong", "bo chay", "khong dung lai", "khong cuu giup"]):
        hints.append("Luật Giao thông đường bộ Bộ luật Hình sự tai nạn giao thông bỏ chạy trách nhiệm bồi thường")

    if has_any(["khong chap hanh an", "bo tron", "tau tan tai san", "thi hanh an"]):
        hints.append("Luật Thi hành án dân sự Luật Thi hành án hình sự Bộ luật Hình sự không chấp hành án trốn tránh thi hành án")

    if has_any(["giay phep xay dung", "xay nha", "xay dung khong phep", "cong trinh"]):
        hints.append("Luật Xây dựng điều kiện cấp giấy phép xây dựng xây dựng nhà ở công trình")

    if has_any(["dat dai", "lan dat", "tranh chap dat", "so do", "quyen su dung dat"]):
        hints.append("Luật Đất đai tranh chấp đất đai quyền sử dụng đất lấn chiếm đất hòa giải")

    if has_any(["nha o", "thue nha", "chu nha", "tien coc"]):
        hints.append("Luật Nhà ở Bộ luật Dân sự hợp đồng thuê nhà đặt cọc")

    if has_any(["ly hon", "cap duong", "nuoi con", "chia tai san vo chong"]):
        hints.append("Luật Hôn nhân và gia đình ly hôn cấp dưỡng nuôi con chia tài sản")

    if has_any(["mua hang", "online", "shop", "khong hoan tien", "hang gia", "nguoi tieu dung"]):
        hints.append("Luật Bảo vệ quyền lợi người tiêu dùng giao dịch hàng hóa hoàn tiền bồi thường")

    if has_any(["dang anh", "mang xa hoi", "xuc pham", "boi nho", "lo thong tin", "an ninh mang"]):
        hints.append("Luật An ninh mạng Bộ luật Dân sự Bộ luật Hình sự danh dự nhân phẩm đời sống riêng tư")

    if has_any(["tam tru", "tam vang", "cu tru", "thuong tru"]):
        hints.append("Luật Cư trú đăng ký thường trú tạm trú")

    if has_any(["can cuoc", "cccd", "can cuoc cong dan", "ma dinh danh"]):
        hints.append("Luật Căn cước thông tin căn cước số định danh cá nhân")

    if has_any(["khieu nai", "quyet dinh hanh chinh"]):
        hints.append("Luật Khiếu nại khiếu nại quyết định hành chính hành vi hành chính")

    if has_any(["to cao", "can bo sai pham", "tham nhung"]):
        hints.append("Luật Tố cáo tố cáo hành vi vi phạm pháp luật cán bộ công chức")

    if has_any(["nganh nghe cam", "dau tu kinh doanh", "nha dau tu"]):
        hints.append("Luật Đầu tư ngành nghề cấm đầu tư kinh doanh điều kiện đầu tư kinh doanh")

    if has_any(["thanh lap doanh nghiep", "cong ty co phan", "doanh nghiep"]):
        hints.append("Luật Doanh nghiệp thành lập doanh nghiệp đăng ký doanh nghiệp")

    if has_any(["thue thu nhap ca nhan", "tncn", "tien luong tinh thue"]):
        hints.append("Luật Thuế thu nhập cá nhân thu nhập từ tiền lương tiền công")

    if has_any(["kham benh", "chua benh", "benh vien", "bac si"]):
        hints.append("Luật Khám bệnh chữa bệnh quyền nghĩa vụ người bệnh cơ sở khám chữa bệnh")

    if has_any(["bao hiem y te", "bhyt", "vien phi"]):
        hints.append("Luật Bảo hiểm y tế chi trả viện phí khám chữa bệnh")

    if has_any(["bao chi", "dang tin sai", "nha bao"]):
        hints.append("Luật Báo chí thông tin sai sự thật cải chính báo chí")

    if has_any(["benh truyen nhiem", "phong benh", "hiv", "lay nhiem", "cach ly"]):
        hints.append("Luật Phòng bệnh phòng chống bệnh truyền nhiễm HIV đường lây truyền phòng tránh lây nhiễm")

    if has_any(["chan nuoi", "gia suc", "gia cam", "o nhiem chan nuoi"]):
        hints.append("Luật Chăn nuôi điều kiện chăn nuôi xử lý chất thải bảo vệ môi trường")

    if has_any(["vien chuc", "ky luat vien chuc", "bo viec vien chuc"]):
        hints.append("Luật Viên chức quyền nghĩa vụ kỷ luật viên chức thôi việc")

    if has_any(["can bo", "cong chuc", "ky luat cong chuc"]):
        hints.append("Luật Cán bộ công chức nghĩa vụ kỷ luật cán bộ công chức")

    if not hints:
        return ""

    return f"{query.strip()} " + " ".join(hints)


def natural_law_search(query: str, limit: int = 10):
    retrieval_query = build_natural_search_query(query)
    if not retrieval_query:
        return {
            "query": query,
            "rewrittenQuery": retrieval_query,
            "results": [],
        }

    results = retrieve_multi_source(retrieval_query, source_filter="all")
    if not results:
        return {
            "query": query,
            "rewrittenQuery": retrieval_query,
            "results": [],
        }

    top_score = float(results[0].get("final_score") or 0)
    top_lexical = float(results[0].get("lexical_score") or 0)
    if top_score < 1.0 and top_lexical < 0.25:
        print("NATURAL SEARCH LOW CONFIDENCE:", {
            "top_score": top_score,
            "top_lexical": top_lexical,
            "top_title": results[0].get("law_title"),
        })
        return {
            "query": query,
            "rewrittenQuery": retrieval_query,
            "results": [],
        }

    seen_articles = set()
    output = []

    for item in results:
        article_id = item.get("article_id")
        if not article_id and item.get("id"):
            import re
            match = re.search(r"art_(\d+)", str(item.get("id")))
            if match:
                article_id = int(match.group(1))

        if not article_id or article_id in seen_articles:
            continue

        seen_articles.add(article_id)
        output.append({
            "articleId": article_id,
            "articleNumber": item.get("article_number"),
            "title": item.get("law_title"),
            "source": item.get("source"),
            "score": item.get("final_score") or item.get("semantic_score") or 0,
            "snippet": item.get("text"),
        })

        if len(output) >= limit:
            break

    return {
        "query": query,
        "rewrittenQuery": retrieval_query,
        "results": output,
    }


def clean_contextual_answer(answer: str) -> str:
    if not isinstance(answer, str):
        return answer

    cleaned = answer.strip()
    prefixes = [
        "Rất tiếc, theo dữ liệu hiện tại của hệ thống ILAS, ",
        "Rất tiếc, ",
    ]

    lower = cleaned.lower()
    has_legal_context = (
        "điều " in lower
        or "luật " in lower
        or "quy định" in lower
    )
    is_no_context = "chưa tìm thấy" in lower or "không tìm thấy" in lower

    if has_legal_context and not is_no_context:
        for prefix in prefixes:
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):].lstrip()
                if cleaned:
                    cleaned = cleaned[0].upper() + cleaned[1:]
                break

    return cleaned


def _is_no_context_answer(answer):
    if not isinstance(answer, str):
        return False

    answer_l = answer.lower()
    markers = [
        "chưa tìm thấy quy định cụ thể",
        "không tìm thấy quy định phù hợp",
        "không có thông tin cần thiết",
        "hiện tại tôi không tìm thấy",
        "tôi chưa tìm thấy quy định",
    ]
    return any(marker in answer_l for marker in markers)


def _is_ai_failure(answer):
    if not isinstance(answer, str):
        return False

    answer_l = answer.lower()
    markers = [
        "ai không trả về",
        "ai trả về kết quả rỗng",
        "gemini fallback failed",
        "json error",
        "gemini_api_key",
        "groq_api_key",
        "đang lỗi cấu hình",
        "quá tải",
        "mất kết nối",
    ]
    return any(marker in answer_l for marker in markers)


def answer_legal_question(query: str, settings: dict = None, history=None):
    if settings is None:
        settings = {}
    if history is None:
        history = []

    if settings.get("enabled") is False:
        return {
            "answer": "Chatbot hiện đang được Admin tạm thời vô hiệu hóa.",
            "context_used": None,
            "source": None,
            "fallback": True,
        }

    if not query or not query.strip():
        return {
            "answer": "Vui lòng nhập câu hỏi hợp lệ.",
            "context_used": None,
            "source": None,
            "fallback": False,
        }

    delay = settings.get("responseDelay", 0)
    if isinstance(delay, (int, float)) and delay > 0:
        time.sleep(delay / 1000)

    source_filter = settings.get("dataSource", "all")

    try:
        retrieval_query = _build_retrieval_query(query, history)
        conversation_context = _format_history(history)

        results = retrieve_multi_source(retrieval_query, source_filter=source_filter)

        print("\n===== DEBUG RETRIEVAL =====")
        print("RETRIEVAL QUERY:", retrieval_query)
        print("TOP SOURCE:", results[0].get("source") if results else None)
        print("TOP ARTICLE_NUMBER:", results[0].get("article_number") if results else None)
        print("TOP ARTICLE_ID:", results[0].get("article_id") if results else None)
        print("TOP TITLE:", results[0].get("law_title") if results else None)
        print("============================\n")

        if not results:
            return {
                "answer": NO_ILAS_CONTEXT_ANSWER,
                "context_used": None,
                "source": None,
                "sources": [],
                "chunks": [],
                "fallback": True,
            }

        top_score = float(results[0].get("final_score") or 0)
        top_lexical = float(results[0].get("lexical_score") or 0)
        if top_score < 1.0 and top_lexical < 0.25:
            return {
                "answer": NO_ILAS_CONTEXT_ANSWER,
                "context_used": None,
                "source": None,
                "sources": [],
                "chunks": [],
                "fallback": True,
            }

        context = build_context(results, max_articles=3)
        context_sources = build_context_sources(results, max_articles=3)

        if not context or len(context.strip()) == 0:
            return {
                "answer": NO_ILAS_CONTEXT_ANSWER,
                "context_used": None,
                "source": None,
                "sources": [],
                "chunks": [],
                "fallback": True,
            }

        try:
            temperature = settings.get("temperature", 0.15)
            max_tokens = settings.get("maxTokens", 900)

            answer = guarded_completion(
                context=context,
                question=query,
                conversation_context=conversation_context,
                temperature=float(temperature),
                max_tokens=int(max_tokens),
            )

            if AI_PROVIDER == "gemini" and _is_ai_failure(answer):
                try:
                    from ai.groq_service import guarded_completion as groq_guarded_completion

                    groq_answer = groq_guarded_completion(
                        context=context,
                        question=query,
                        conversation_context=conversation_context,
                        temperature=float(temperature),
                        max_tokens=int(max_tokens),
                    )
                    if isinstance(groq_answer, str) and groq_answer.strip():
                        answer = groq_answer
                except Exception as fallback_err:
                    print("GROQ FALLBACK ERROR:", repr(fallback_err))

            if _is_no_context_answer(answer):
                return {
                    "answer": NO_ILAS_CONTEXT_ANSWER,
                    "context_used": None,
                    "source": None,
                    "sources": [],
                    "chunks": [],
                    "fallback": True,
                }

            answer = clean_contextual_answer(answer)

        except Exception as e:
            print(f"{_ACTIVE_PROVIDER.upper()} COMPLETION ERROR:", repr(e))
            return {
                "answer": "Hệ thống AI gặp lỗi khi sinh câu trả lời. Vui lòng thử lại.",
                "context_used": None,
                "source": None,
                "sources": [],
                "chunks": [],
                "fallback": True,
            }

        top = results[0]
        article_number = top.get("article_number")
        source_title = context_sources[0] if context_sources else top.get("law_title")
        source = f"article_{article_number}" if article_number else None

        return {
            "answer": answer,
            "context_used": source_title,
            "source": source,
            "sources": [source] if source else [],
            "chunks": context_sources if context_sources else ([source_title] if source_title else []),
            "fallback": False,
        }

    except Exception as e:
        print("PIPELINE ERROR:", repr(e))
        return {
            "answer": "Lỗi hệ thống nội bộ. Vui lòng thử lại sau.",
            "error": str(e),
            "context_used": None,
            "source": None,
            "sources": [],
            "chunks": [],
            "fallback": False,
        }


if __name__ == "__main__":
    while True:
        q = input("Hỏi pháp lý ('exit' để thoát): ")
        if q.lower().strip() == "exit":
            break

        result = answer_legal_question(q)
        print("\n===== ANSWER =====")
        print(result["answer"])
        print("\n===== CONTEXT USED =====")
        print(result["context_used"])
        print("\n===== SOURCE =====")
        print(result["source"])
        print("\n===== FALLBACK =====")
        print(result["fallback"])
