from db_core import execute_query
import re

def load_full_article(article_id: str) -> str:
    # Truy vấn chuẩn mới (Dùng ID)
    query = """
        SELECT l.title as law_name, a.article_title, a.content 
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.article_id = %s
        LIMIT 1
    """
    row = execute_query(query, (article_id,), fetchone=True)
    if not row: return None
    return f"[{row['law_name']}]\n{row['article_title']}\n\n{row['content']}"

def load_full_article_by_number(article_number: str) -> str:
    # Dành riêng cho hàm phím tắt detect_intent (Ép tìm trong Bộ Luật Lao động - law_id = 1)
    query = """
        SELECT l.title as law_name, a.article_title, a.content 
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.article_number = %s AND a.law_id = 1
        LIMIT 1
    """
    row = execute_query(query, (article_number,), fetchone=True)
    if not row: return None
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

    # 1. Nếu có ID -> Tìm theo ID (Vector Search gọi)
    if article_id:
        return load_full_article(article_id)
        
    # 2. Nếu không có ID mà chỉ có số Điều -> Tìm theo Số Điều (Hàm Intent gọi)
    article_number = top.get("article_number")
    if article_number:
        return load_full_article_by_number(article_number)

    return None