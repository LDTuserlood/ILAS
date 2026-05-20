# ai/gemini_service.py — ILAS Legal Edition (Gemini version, kept parallel to Groq)

import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def _candidate_models():
    raw = os.getenv("GEMINI_FALLBACK_MODELS", "gemini-1.5-flash,gemini-1.5-pro")
    extra = [m.strip() for m in raw.split(",") if m.strip()]
    ordered = [MODEL_NAME] + extra
    seen = set()
    unique = []
    for m in ordered:
        if m not in seen:
            seen.add(m)
            unique.append(m)
    return unique


def _post_to_gemini(messages, temperature: float, max_tokens: int) -> str:
    if not API_KEY:
        return "⚠️ GEMINI_API_KEY chưa được cấu hình trong .env."

    try:
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "role": msg["role"],
                    "parts": [{"text": msg["content"]}],
                }
                for msg in messages
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }

        last_error = None
        for model in _candidate_models():
            res = requests.post(
                API_URL.format(model=model),
                params={"key": API_KEY},
                headers=headers,
                json=payload,
                timeout=40,
            )

            try:
                j = res.json()
            except Exception as e:
                print("Gemini JSON ERROR:", e, "Raw:", res.text[:500])
                return "AI không trả về dữ liệu hợp lệ (JSON error)."

            if "error" in j:
                err = j.get("error", {})
                status = str(err.get("status", "")).upper()
                message = str(err.get("message", ""))
                print(f"Gemini API ERROR [{model}] {status}: {message}")
                last_error = j
                if status == "NOT_FOUND":
                    continue
                return "Hệ thống AI Gemini đang lỗi cấu hình hoặc quá tải. Vui lòng thử lại."

            candidates = j.get("candidates", [])
            if not candidates:
                print(f"Gemini EMPTY CANDIDATES [{model}]", j)
                last_error = j
                continue

            candidate = candidates[0]
            content = candidate.get("content", {})
            parts = content.get("parts", []) if isinstance(content, dict) else []
            text_chunks = [part.get("text", "") for part in parts if isinstance(part, dict)]
            content_text = "".join(text_chunks).strip()

            if content_text:
                return content_text

            print(f"Gemini EMPTY CONTENT [{model}]", j)
            last_error = j

        print("Gemini ALL MODELS FAILED:", last_error)
        return "AI không trả về kết quả phù hợp (Gemini fallback failed)."

    except Exception as e:
        print("Gemini REQUEST ERROR:", repr(e))
        return "Hệ thống AI đang gặp sự cố hoặc mất kết nối. Vui lòng thử lại."


def guarded_completion(
    context: str,
    question: str,
    conversation_context: str = "",
    temperature: float = 0.15,
    max_tokens: int = 900
) -> str:
    """
    ILAS Legal Answer Engine — Gemini version.
    Giữ cùng contract với groq_service.py để backend dễ chuyển đổi.
    """

    try:
        temperature = float(temperature)
    except Exception:
        temperature = 0.15

    try:
        max_tokens = int(max_tokens)
    except Exception:
        max_tokens = 900

    system_prompt = """
Bạn là trợ lý pháp lý của hệ thống ILAS, chỉ tư vấn dựa trên văn bản pháp luật Việt Nam.

NGUYÊN TẮC TRẢ LỜI:

1. NGUỒN DUY NHẤT
- Chỉ được sử dụng thông tin trong phần "NGỮ CẢNH PHÁP LUẬT".
- Không được dùng kiến thức ngoài hoặc phỏng đoán.

2. TRÍCH DẪN
- Nếu văn bản trong ngữ cảnh có Điều/Khoản/Điểm → phải trích dẫn đúng.
- Nếu không có số điều → không được tự đặt.

3. KHÔNG ĐƯỢC BỊA
- Không thêm quy định, thời hạn, phần trăm, ngày, nghĩa vụ… nếu không xuất hiện trong ngữ cảnh.
- Không được suy luận thêm theo kinh nghiệm.

4. TỔNG HỢP HỢP LÝ
- Nếu các điểm/khoản trong ngữ cảnh có số liệu, bạn được phép tổng hợp.
- Đây không được xem là bịa vì dựa 100% vào dữ liệu trong ngữ cảnh.

5. TRẢ LỜI THEO ĐỐI TƯỢNG
- Nếu điều luật chia thành nhiều nhóm đối tượng, phải trình bày tách riêng.

6. THIẾU THÔNG TIN
- Nếu ngữ cảnh không có thông tin cần thiết → trả lời:
  "Hiện tại tôi không tìm thấy quy định phù hợp trong dữ liệu ILAS."

7. PHONG CÁCH TRẢ LỜI
- Trả lời ngắn gọn.
- Chỉ nêu kết luận và số liệu quan trọng.

8. TÍNH TOÁN CHÍNH XÁC
- Khi tổng hợp số liệu: liệt kê phép tính (ví dụ: 1 + 5 + 1 ...)
- Kiểm tra lại để đảm bảo kết quả chính xác.
"""

    user_prompt = f"""
NGỮ CẢNH PHÁP LUẬT (trích từ cơ sở dữ liệu ILAS):
-------------------------------------------------
{context}
-------------------------------------------------

CÂU HỎI:
{question}

LICH SU HOI THOAI GAN DAY:
{conversation_context or "Khong co"}

YÊU CẦU TRẢ LỜI:
- Dựa 100% trên nội dung trong ngữ cảnh.
- Không được suy diễn.
- Nếu luật chia nhóm đối tượng → trình bày tách riêng.
- Nếu thiếu thông tin trong ngữ cảnh → nói rõ là không tìm thấy.
"""

    messages = [
        {"role": "user", "content": system_prompt + "\n\n" + user_prompt},
    ]

    return _post_to_gemini(messages, temperature=temperature, max_tokens=max_tokens)


def fallback_general_answer(question: str) -> str:
    """
    Fallback khi retrieval yếu → dùng kiến thức tổng quát của Gemini.
    Không dựa trên context ILAS.
    """
    system_prompt = """
Bạn là trợ lý pháp lý tổng quát.
Hãy trả lời dựa trên kiến thức phổ biến, KHÔNG dùng context luật.
Trả lời ngắn gọn, dễ hiểu.
Không trích dẫn điều khoản cụ thể.
"""

    messages = [
        {"role": "user", "content": system_prompt + "\n\n" + question},
    ]

    return _post_to_gemini(messages, temperature=0.5, max_tokens=500)


def rewrite_contextual_query(current_question: str, conversation_context: str) -> str:
    """
    Rewrite a follow-up chat message into a standalone legal search query.
    This is used before RAG retrieval, so it must not answer the user.
    """
    prompt = f"""
Bạn là bộ phận viết lại câu hỏi cho hệ thống tìm kiếm RAG pháp luật Việt Nam.

Nhiệm vụ:
- Viết lại CÂU HỎI HIỆN TẠI thành một câu truy vấn pháp lý độc lập, đầy đủ ngữ cảnh để đem đi tìm điều luật.
- Dùng LỊCH SỬ HỘI THOẠI để hiểu các cụm mơ hồ như: "thế", "vậy", "cái đó", "trường hợp này", "có lây không", "không cấm là gì".
- Bổ sung các từ khóa pháp lý có khả năng giúp tìm đúng điều luật, ví dụ: đường lây truyền, bệnh truyền nhiễm, HIV, trách nhiệm phòng chống lây nhiễm, tiền lương, tạm ứng tiền lương, ngành nghề cấm đầu tư kinh doanh.
- Nếu câu hỏi hiện tại rõ ràng là chủ đề mới, hãy viết lại theo chủ đề mới, không ép lịch sử cũ vào.
- Không trả lời câu hỏi.
- Không giải thích.
- Không xuống dòng nhiều dòng.
- Chỉ trả về duy nhất một câu truy vấn tiếng Việt.

Ví dụ:
Lịch sử: Người dùng hỏi "có các biện pháp nào phòng chống bệnh lây nhiễm ko"; AI trả lời về biện pháp phòng chống bệnh lây nhiễm.
Câu hỏi hiện tại: "thế tôi bị nhiễm HIV có lây cho ai ko"
Kết quả: Trong bối cảnh biện pháp phòng chống bệnh lây nhiễm, HIV có lây truyền cho người khác không, bệnh lây nhiễm qua đường nào, trách nhiệm phòng tránh lây nhiễm là gì?

LỊCH SỬ HỘI THOẠI:
{conversation_context or "Khong co"}

CÂU HỎI HIỆN TẠI:
{current_question}
"""

    messages = [
        {"role": "user", "content": prompt},
    ]

    rewritten = _post_to_gemini(messages, temperature=0.05, max_tokens=160)
    return rewritten.strip() if isinstance(rewritten, str) and rewritten.strip() else current_question
