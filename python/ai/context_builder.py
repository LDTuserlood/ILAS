# ai/context_builder.py (PATCHED)

from db_core import get_connection

def load_full_article(article_number: str) -> str:
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT article_title, content
            FROM articles
            WHERE article_number = %s
            LIMIT 1
        """, (article_number,))
        row = cur.fetchone()

    if not row:
        return None

    return f"{row['article_title']}\n\n{row['content']}"


def build_context(results):

    if not results:
        return None

    top = results[0]

    # Chỉ chấp nhận context từ nguồn articles
    if top.get("source") not in ["articles", "articles/chunks"]:
        return None

    article_number = top.get("article_number")

    if not article_number:
        return None

    full_article = load_full_article(article_number)

    if full_article:
        return full_article

    return None

