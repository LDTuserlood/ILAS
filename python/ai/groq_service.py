import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = os.getenv("GROQ_API_KEY")


def _post_to_groq(messages, temperature: float, max_tokens: int) -> str:
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