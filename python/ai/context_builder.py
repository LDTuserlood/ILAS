import re

from db_core import execute_query


def load_full_article(article_id: str) -> str:
    query = """
        SELECT l.title as law_name, a.article_title, a.content
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.article_id = %s
        LIMIT 1
    """
    row = execute_query(query, (article_id,), fetchone=True)
    if not row:
        return None
    return f"[{row['law_name']}]\n{row['article_title']}\n\n{row['content']}"


def load_full_article_by_number(article_number: str) -> str:
    query = """
        SELECT l.title as law_name, a.article_title, a.content
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.article_number = %s
          AND a.status = 'active'
          AND l.status = 'active'
        ORDER BY
          CASE
            WHEN LOWER(l.title) LIKE '%lao động%' OR LOWER(l.title) LIKE '%lao dong%' THEN 0
            ELSE 1
          END,
          l.law_id DESC
        LIMIT 1
    """
    row = execute_query(query, (article_number,), fetchone=True)
    if not row:
        return None
    return f"[{row['law_name']}]\n{row['article_title']}\n\n{row['content']}"


def build_context(results):
    if not results:
        return None

    top = results[0]

    if top.get("source") not in ["articles", "articles/chunks"]:
        return None

    article_id = top.get("article_id")

    if not article_id and top.get("id"):
        match = re.search(r"art_(\d+)", top.get("id"))
        if match:
            article_id = match.group(1)

    if article_id:
        return load_full_article(article_id)

    article_number = top.get("article_number")
    if article_number:
        return load_full_article_by_number(article_number)

    return None
