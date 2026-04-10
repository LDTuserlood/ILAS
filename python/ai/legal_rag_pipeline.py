# ai/legal_rag_pipeline.py
# -------------------------------------------------------
# LEGAL RAG LEVEL 8 – FULL ARTICLE CONTEXT + HYBRID MODE
# -------------------------------------------------------

from ai.retrieval_level6 import retrieve_multi_source
from ai.context_builder import build_context
from ai.groq_service import guarded_completion, fallback_general_answer
import time


def answer_legal_question(query: str, settings: dict = None):
    # 0.5) Check enabled
    if settings.get("enabled") is False:
        return {
            "answer": "⚠️ Chatbot hiện đang được Admin tạm thời vô hiệu hóa.",
            "context_used": None,
            "source": None,
            "fallback": True
        }

    """
    LEGAL RAG PIPELINE – LEVEL 8 (Full Article Context + Hybrid Mode)
    + Hỗ trợ Admin Settings (delay, datasource, temperature…)
    """

    if settings is None:
        settings = {}

    # 0) Validate câu hỏi
    if not query or not query.strip():
        return {
            "answer": "Vui lòng nhập câu hỏi hợp lệ.",
            "context_used": None,
            "source": None,
            "fallback": False
        }

    # 1) Delay nếu Admin config
    delay = settings.get("responseDelay", 0)
    if isinstance(delay, (int, float)) and delay > 0:
        time.sleep(delay / 1000)

    # 2) Filter nguồn dữ liệu
    source_filter = settings.get("dataSource", "all")

    try:
        # 3) Retrieval (có filter nguồn)
        results = retrieve_multi_source(query, source_filter=source_filter)

        print("\n===== DEBUG RETRIEVAL =====")
        print("TOP SOURCE:", results[0].get("source") if results else None)
        print("TOP ARTICLE_NUMBER:", results[0].get("article_number") if results else None)
        print("TOP RAW:", results[0] if results else None)
        print("============================\n")

        # Retrieval fail
        if not results:
            fb = fallback_general_answer(query)
            return {
                "answer": fb + "\n\n⚠️ *Ghi chú: Câu trả lời này không dựa trên dữ liệu ILAS (fallback Groq).*",
                "context_used": None,
                "source": "fallback",
                "fallback": True
            }

        # 4) Build FULL ARTICLE CONTEXT
        context = build_context(results)

        if not context or len(context.strip()) == 0:
            fb = fallback_general_answer(query)
            return {
                "answer": fb + "\n\n⚠️ *Không tìm thấy quy định phù hợp trong dữ liệu ILAS (fallback Groq).*",
                "context_used": None,
                "source": "fallback",
                "fallback": True
            }

        # 5) STRICT LEGAL MODE
        try:
            temperature = settings.get("temperature", 0.15)
            max_tokens = settings.get("maxTokens", 900)

            answer = guarded_completion(
                context=context,
                question=query,
                temperature=float(temperature),
                max_tokens=int(max_tokens)
            )

        except Exception as e:
            print("❌ GROQ COMPLETION ERROR:", repr(e))
            return {
                "answer": "⚠️ Hệ thống AI gặp lỗi khi sinh câu trả lời. Vui lòng thử lại.",
                "context_used": None,
                "source": None,
                "fallback": True
            }

        # 6) Extracting source
        top = results[0]
        article_number = top.get("article_number")
        source_title = top.get("law_title")

        return {
            "answer": answer,
            "context_used": source_title,
            "source": f"article_{article_number}",
            "fallback": False
        }

    except Exception as e:
        print("❌ PIPELINE ERROR:", repr(e))
        return {
            "answer": "❌ Lỗi hệ thống nội bộ. Vui lòng thử lại sau.",
            "error": str(e),
            "context_used": None,
            "source": None,
            "fallback": False
        }



# Test mode
if __name__ == "__main__":
    while True:
        q = input("❓ Hỏi pháp lý ('exit' để thoát): ")
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

