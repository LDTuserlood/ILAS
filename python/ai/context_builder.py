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


def _result_article_id(result):
    article_id = result.get("article_id")
    if article_id:
        return str(article_id)

    result_id = str(result.get("id") or "")
    match = re.search(r"art_(\d+)", result_id)
    return match.group(1) if match else None


def _collect_context_articles(results, max_articles=3):
    if not results:
        return []

    contexts = []
    seen = set()

    for item in results:
        if item.get("source") not in ["articles", "articles/chunks"]:
            continue

        article_id = _result_article_id(item)
        article_number = item.get("article_number")
        key = f"id:{article_id}" if article_id else f"no:{article_number}"
        if not key or key in seen:
            continue

        context = load_full_article(article_id) if article_id else None
        if not context and article_number:
            context = load_full_article_by_number(article_number)

        if not context:
            continue

        seen.add(key)
        contexts.append({
            "article_id": article_id,
            "article_number": article_number,
            "law_title": item.get("law_title"),
            "source": item.get("source"),
            "context": context,
        })

        if len(contexts) >= max_articles:
            break

    return contexts


def build_context(results, max_articles=3):
    contexts = _collect_context_articles(results, max_articles=max_articles)
    if not contexts:
        return None

    return "\n\n---\n\n".join(item["context"] for item in contexts)


def build_context_sources(results, max_articles=3):
    contexts = _collect_context_articles(results, max_articles=max_articles)
    sources = []

    for item in contexts:
        label = item.get("law_title") or item.get("article_number")
        if label and label not in sources:
            sources.append(str(label))

    return sources
