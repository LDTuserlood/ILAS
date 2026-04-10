import numpy as np
import json
import re
from pathlib import Path
import sys

# Allow import from parent folder
sys.path.append(str(Path(__file__).resolve().parents[1]))

from ai.local_embedder import get_local_embedding
from db_core import get_connection

# CHUNKING CHUẨN CHO LUẬT VN
def split_into_chunks(text):
    text = text.replace("\r", " ").replace("\n", " ")

    # Regex chia khoản, điểm: 1. , 2. , a), b), c), đ)
    parts = re.split(r"(?=(\d+\.\s+|[a-zđ]\)\s+))", text, flags=re.IGNORECASE)

    chunks = []
    current = ""

    for part in parts:
        if re.match(r"\d+\.\s+|[a-zđ]\)\s+", part, flags=re.IGNORECASE):
            if current.strip():
                chunks.append(current.strip())
            current = part
        else:
            current += part

    if current.strip():
        chunks.append(current.strip())

    # Bỏ chunk quá ngắn
    chunks = [c for c in chunks if len(c.strip()) > 25]

    return chunks


# PHÂN TÍCH CLAUSE NUMBER (khoản số mấy)
def extract_clause_number(chunk_text):
    m = re.match(r"(\d+)\.\s+", chunk_text)
    if m:
        return int(m.group(1))
    return None


# LOAD ARTICLES TỪ DB
def load_articles():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT article_id, article_number, article_title, content
            FROM articles
            WHERE status='active'
        """)
        return cur.fetchall()

# BUILD VECTOR STORE CHUNK LEVEL 4
def build_chunk_store():
    articles = load_articles()
    vectors = []
    metadata = []

    print(f"🚀 Building CHUNK vector store for {len(articles)} articles...")

    for art in articles:
        chunks = split_into_chunks(art["content"] or "")

        for idx, chunk_text in enumerate(chunks):
            emb = get_local_embedding(chunk_text)
            if emb is None:
                continue

            vectors.append(emb)

            metadata.append({
                "id": f"article_{art['article_number']}_chunk_{idx}",
                "article_number": art["article_number"],
                "law_title": art["article_title"],
                "clause_number": extract_clause_number(chunk_text),
                "text": chunk_text,
                "source_type": "articles"
            })

    vectors = np.array(vectors, dtype=np.float32)

    # SAVE ĐÚNG THƯ MỤC LEVEL 4
    out_dir = Path("vector_store/articles/chunks")
    out_dir.mkdir(parents=True, exist_ok=True)

    np.save(out_dir / "vectors.npy", vectors)
    with open(out_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"DONE — {len(vectors)} chunks stored at vector_store/articles/chunks/")


if __name__ == "__main__":
    build_chunk_store()
