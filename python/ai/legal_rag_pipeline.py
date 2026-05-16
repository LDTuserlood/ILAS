import os
import time
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from ai.retrieval_level6 import retrieve_multi_source
from ai.context_builder import build_context
from ai.groq_service import rewrite_legal_query

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower().strip()

if AI_PROVIDER == "groq":
    from ai.groq_service import guarded_completion
    _ACTIVE_PROVIDER = "Groq"
else:
    from ai.gemini_service import guarded_completion
    _ACTIVE_PROVIDER = "Gemini"


NO_ILAS_CONTEXT_ANSWER = (
    "Rất tiếc, theo dữ liệu hiện tại của hệ thống ILAS, tôi chưa tìm thấy "
    "quy định cụ thể phù hợp với câu hỏi này để hỗ trợ bạn."
)


def clean_contextual_answer(answer: str) -> str:
    if not isinstance(answer, str):
        return answer

    prefixes = [
        "Rất tiếc, theo dữ liệu hiện tại của hệ thống ILAS, ",
        "Rất tiếc, ",
    ]
    cleaned = answer.strip()
    lower = cleaned.lower()
    if (
        "điều " in lower
        or "luật " in lower
        or "quy định" in lower
    ) and "chưa tìm thấy" not in lower and "không tìm thấy" not in lower:
        for prefix in prefixes:
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):].lstrip()
                if cleaned:
                    cleaned = cleaned[0].upper() + cleaned[1:]
                break
    return cleaned


def answer_legal_question(query: str, settings: dict = None):
    if settings is None:
        settings = {}

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
        results = retrieve_multi_source(query, source_filter=source_filter)

        print("\n===== DEBUG RETRIEVAL =====")
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
                "fallback": True,
            }

        top_score = float(results[0].get("final_score") or 0)
        top_lexical = float(results[0].get("lexical_score") or 0)
        if top_score < 1.0 and top_lexical < 0.25:
            return {
                "answer": NO_ILAS_CONTEXT_ANSWER,
                "context_used": None,
                "source": None,
                "fallback": True,
            }

        context = build_context(results)

        if not context or len(context.strip()) == 0:
            return {
                "answer": NO_ILAS_CONTEXT_ANSWER,
                "context_used": None,
                "source": None,
                "fallback": True,
            }

        try:
            temperature = settings.get("temperature", 0.15)
            max_tokens = settings.get("maxTokens", 900)

            answer = guarded_completion(
                context=context,
                question=query,
                temperature=float(temperature),
                max_tokens=int(max_tokens),
            )

            if AI_PROVIDER == "gemini" and isinstance(answer, str):
                fail_markers = [
                    "AI không trả về",
                    "AI trả về kết quả rỗng",
                    "Hệ thống AI Gemini đang lỗi",
                    "Gemini fallback failed",
                    "JSON error",
                    "GEMINI_API_KEY",
                ]
                if any(marker in answer for marker in fail_markers):
                    try:
                        from ai.groq_service import guarded_completion as groq_guarded_completion

                        groq_answer = groq_guarded_completion(
                            context=context,
                            question=query,
                            temperature=float(temperature),
                            max_tokens=int(max_tokens),
                        )
                        if isinstance(groq_answer, str) and groq_answer.strip():
                            answer = groq_answer
                    except Exception as fallback_err:
                        print("GROQ FALLBACK ERROR:", repr(fallback_err))

            if isinstance(answer, str):
                no_context_markers = [
                    "chưa tìm thấy quy định cụ thể",
                    "không tìm thấy quy định phù hợp",
                    "không có thông tin cần thiết",
                ]
                answer_l = answer.lower()
                if any(marker in answer_l for marker in no_context_markers):
                    return {
                        "answer": NO_ILAS_CONTEXT_ANSWER,
                        "context_used": None,
                        "source": None,
                        "fallback": True,
                    }

            answer = clean_contextual_answer(answer)

        except Exception as e:
            print(f"{_ACTIVE_PROVIDER.upper()} COMPLETION ERROR:", repr(e))
            return {
                "answer": "Hệ thống AI gặp lỗi khi sinh câu trả lời. Vui lòng thử lại.",
                "context_used": None,
                "source": None,
                "fallback": True,
            }

        top = results[0]
        article_number = top.get("article_number")
        source_title = top.get("law_title")

        return {
            "answer": answer,
            "context_used": source_title,
            "source": f"article_{article_number}" if article_number else None,
            "fallback": False,
        }

    except Exception as e:
        print("PIPELINE ERROR:", repr(e))
        return {
            "answer": "Lỗi hệ thống nội bộ. Vui lòng thử lại sau.",
            "error": str(e),
            "context_used": None,
            "source": None,
            "fallback": False,
        }


if __name__ == "__main__":
    while True:
        q = input("Hoi phap ly ('exit' de thoat): ")
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
