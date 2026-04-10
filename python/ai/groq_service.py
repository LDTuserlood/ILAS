# ai/groq_service.py — ILAS Legal Edition (Optimized + Supports Settings)

import os
import requests
from dotenv import load_dotenv

load_dotenv()

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
    (GIỮ NGUYÊN NGUYÊN TẮC CỦA BẠN)
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

YÊU CẦU TRẢ LỜI:
- Dựa 100% trên nội dung trong ngữ cảnh.
- Không được suy diễn.
- Nếu luật chia nhóm đối tượng → trình bày tách riêng.
- Nếu thiếu thông tin trong ngữ cảnh → nói rõ là không tìm thấy.
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
Bạn là trợ lý pháp lý tổng quát.
Hãy trả lời dựa trên kiến thức phổ biến, KHÔNG dùng context luật.
Trả lời ngắn gọn, dễ hiểu.
Không trích dẫn điều khoản cụ thể.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]

    return _post_to_groq(messages, temperature=0.5, max_tokens=500)

