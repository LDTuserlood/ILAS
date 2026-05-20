import os
import requests
import re
import time
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = os.getenv("GROQ_API_KEY")
MAX_RATE_LIMIT_RETRY_SECONDS = 20
RATE_LIMIT_FALLBACK = (
    "Hệ thống AI đang bị giới hạn lượt xử lý tạm thời. "
    "Bạn vui lòng thử lại sau vài giây nhé."
)


def _extract_retry_seconds(payload, response):
    retry_after = response.headers.get("Retry-After")
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass

    message = ""
    if isinstance(payload, dict):
        message = str((payload.get("error") or {}).get("message") or "")

    match = re.search(r"try again in ([0-9.]+)s", message, flags=re.IGNORECASE)
    return float(match.group(1)) if match else None


def _post_to_groq(messages, temperature: float, max_tokens: int, _retry_count: int = 0) -> str:
    if not API_KEY:
        return "⚠️ GROQ_API_KEY chưa được cấu hình trong .env."

    try:
        headers = {"Authorization": f"Bearer {API_KEY}"}
        data = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        res = requests.post(API_URL, headers=headers, json=data, timeout=40)

        try:
            j = res.json()
        except Exception as e:
            print("Groq JSON ERROR:", e, "Raw:", res.text[:500])
            return "AI không trả về dữ liệu hợp lệ (JSON error)."

        if res.status_code == 429 or (j.get("error") or {}).get("code") == "rate_limit_exceeded":
            retry_seconds = _extract_retry_seconds(j, res)
            if (
                _retry_count == 0
                and retry_seconds is not None
                and retry_seconds <= MAX_RATE_LIMIT_RETRY_SECONDS
            ):
                print(f"Groq RATE LIMITED: retrying after {retry_seconds:.2f}s")
                time.sleep(retry_seconds + 0.5)
                return _post_to_groq(messages, temperature, max_tokens, _retry_count + 1)

            print("Groq RATE LIMITED:", j)
            return RATE_LIMIT_FALLBACK

        if "choices" not in j:
            print("Groq NO CHOICES:", j)
            return "AI không trả về kết quả (no choices)."

        if not j["choices"]:
            print("Groq EMPTY CHOICES:", j)
            return "AI trả về kết quả rỗng."

        content = j["choices"][0].get("message", {}).get("content", "").strip()
        if not content:
            print("Groq EMPTY CONTENT:", j)
            return "AI không sinh ra nội dung trả lời."

        return content

    except Exception as e:
        print("Groq REQUEST ERROR:", repr(e))
        return "Hệ thống AI đang gặp sự cố hoặc mất kết nối. Vui lòng thử lại."


def guarded_completion(
    context: str,
    question: str,
    conversation_context: str = "",
    temperature: float = 0.15,
    max_tokens: int = 900
) -> str:
    """
    ILAS Legal Answer Engine — Strict + Summarization Mode
    (Đã tối ưu để AI nói chuyện TỰ NHIÊN, THÂN THIỆN)
    """

    # Ép kiểu an toàn (FE hay gửi "0.7", "500" dạng string)
    try:
        temperature = float(temperature)
    except:
        temperature = 0.15

    try:
        max_tokens = int(max_tokens)
    except:
        max_tokens = 900

    system_prompt = """
Bạn là một chuyên viên tư vấn pháp luật lao động thân thiện, tận tâm và chuyên nghiệp của nền tảng ILAS.
Nhiệm vụ của bạn là giải đáp thắc mắc cho người lao động dựa TRÊN ĐÚNG NGỮ CẢNH LUẬT được cung cấp.

=== QUY TẮC TRẢ LỜI BẮT BUỘC ===
1. GIỌNG ĐIỆU TỰ NHIÊN: Xưng "tôi" và gọi người dùng là "bạn". Trả lời tự nhiên, thân thiện như đang trò chuyện tư vấn. Diễn giải lại các từ ngữ pháp lý khô khan thành ngôn ngữ đơn giản, dễ hiểu đối với người công nhân bình thường.
2. NGUỒN DUY NHẤT: Chỉ được sử dụng thông tin trong phần "NGỮ CẢNH PHÁP LUẬT". Không được dùng kiến thức ngoài, không suy diễn, không tự bịa ra số liệu/ngày tháng.
3. TRÍCH DẪN KHÉO LÉO: Luôn đi thẳng vào vấn đề trả lời câu hỏi trước (Ví dụ: "Mức trợ cấp của bạn là..."), sau đó mới giải thích chi tiết dựa theo Điều mấy của luật trong ngữ cảnh.
4. TỔNG HỢP HỢP LÝ: Nếu các điểm/khoản trong ngữ cảnh có số liệu, bạn được phép tổng hợp và tính toán (liệt kê rõ phép tính).
5. THIẾU THÔNG TIN: Nếu ngữ cảnh không có thông tin cần thiết → trả lời tự nhiên: "Rất tiếc, theo dữ liệu hiện tại của hệ thống ILAS, tôi chưa tìm thấy quy định cụ thể về vấn đề này để hỗ trợ bạn."
"""

    user_prompt = f"""
NGỮ CẢNH PHÁP LUẬT (trích từ cơ sở dữ liệu ILAS):
-------------------------------------------------
{context}
-------------------------------------------------

CÂU HỎI CỦA NGƯỜI DÙNG:
{question}

Lich su hoi thoai gan day:
{conversation_context or "Khong co"}
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    return _post_to_groq(messages, temperature=temperature, max_tokens=max_tokens)


def fallback_general_answer(question: str) -> str:
    """
    Fallback khi retrieval yếu → dùng kiến thức tổng quát của Groq.
    Không dựa trên context ILAS.
    """
    system_prompt = """
Bạn là trợ lý pháp lý tổng quát của ILAS. Hãy xưng "tôi" và gọi "bạn" thân thiện.
Hãy trả lời câu hỏi dưới đây dựa trên kiến thức phổ biến, KHÔNG dùng context luật.
Trả lời ngắn gọn, dễ hiểu cho người công nhân.
Không trích dẫn điều khoản cụ thể.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]

    return _post_to_groq(messages, temperature=0.5, max_tokens=500)


def rewrite_legal_query(user_question: str) -> str:
    """
    Sử dụng AI để chuyển câu hỏi tự nhiên thành cụm từ khóa pháp lý chuẩn.
    Giúp Semantic Search tìm luật chính xác hơn.
    """
    system_prompt = """
Bạn là chuyên gia phân tích ngôn ngữ pháp lý. 
Nhiệm vụ của bạn là chuyển đổi câu hỏi thông tục của người dùng thành MỘT CÂU TRUY VẤN TỪ KHÓA pháp lý chuẩn xác để tìm kiếm trong cơ sở dữ liệu luật lao động.

QUY TẮC BẮT BUỘC:
1. CHỈ TRẢ VỀ DUY NHẤT CÂU TRUY VẤN đã tối ưu. KHÔNG có câu chào, KHÔNG giải thích, KHÔNG ngoặc kép.
2. Dùng đúng thuật ngữ luật (VD: "nghỉ đẻ" -> "chế độ thai sản", "đuổi việc" -> "đơn phương chấm dứt hợp đồng", "đền bao nhiêu" -> "mức bồi thường").
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f'Hãy tối ưu câu hỏi này: "{user_question}"'},
    ]

    # Gọi AI bằng hàm _post_to_groq có sẵn, temp thấp để câu từ chuẩn xác
    optimized = _post_to_groq(messages, temperature=0.1, max_tokens=100)
    
    # Nếu AI lỗi hoặc trả về rỗng, dùng tạm câu hỏi cũ
    if not optimized or "Hệ thống AI đang gặp sự cố" in optimized or "JSON error" in optimized:
        return user_question
        
    return optimized.strip()


def rewrite_contextual_query(current_question: str, conversation_context: str) -> str:
    """
    Rewrite a follow-up chat message into a standalone legal search query.
    This is used before RAG retrieval, so it must not answer the user.
    """
    system_prompt = """
Bạn là bộ phận viết lại câu hỏi cho hệ thống tìm kiếm RAG pháp luật Việt Nam.

Nhiệm vụ:
1. Viết lại câu hỏi hiện tại thành một câu truy vấn pháp lý độc lập, đầy đủ ngữ cảnh để đem đi tìm điều luật.
2. Dùng lịch sử hội thoại để hiểu các cụm mơ hồ như: "thế", "vậy", "cái đó", "trường hợp này", "có lây không", "không cấm là gì".
3. Bổ sung các từ khóa pháp lý có khả năng giúp tìm đúng điều luật, ví dụ: đường lây truyền, bệnh truyền nhiễm, HIV, trách nhiệm phòng chống lây nhiễm, tiền lương, tạm ứng tiền lương, ngành nghề cấm đầu tư kinh doanh.
4. Nếu câu hỏi hiện tại rõ ràng là chủ đề mới, hãy viết lại theo chủ đề mới, không ép lịch sử cũ vào.
5. Không trả lời câu hỏi.
6. Không giải thích.
7. Không xuống dòng nhiều dòng.
8. Chỉ trả về duy nhất một câu truy vấn tiếng Việt.

Ví dụ:
Lịch sử: Người dùng hỏi "có các biện pháp nào phòng chống bệnh lây nhiễm ko"; AI trả lời về biện pháp phòng chống bệnh lây nhiễm.
Câu hỏi hiện tại: "thế tôi bị nhiễm HIV có lây cho ai ko"
Kết quả: Trong bối cảnh biện pháp phòng chống bệnh lây nhiễm, HIV có lây truyền cho người khác không, bệnh lây nhiễm qua đường nào, trách nhiệm phòng tránh lây nhiễm là gì?
"""

    user_prompt = f"""
LỊCH SỬ HỘI THOẠI:
{conversation_context or "Khong co"}

CÂU HỎI HIỆN TẠI:
{current_question}
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    rewritten = _post_to_groq(messages, temperature=0.05, max_tokens=160)
    return rewritten.strip() if isinstance(rewritten, str) and rewritten.strip() else current_question
