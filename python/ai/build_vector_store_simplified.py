# ai/build_vector_store_simplified.py
import json
import numpy as np
from pathlib import Path
from ai.local_embedder import get_local_embedding
from db_core import get_connection

OUT_DIR = Path("vector_store/simplified")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def load_simplified_from_db():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT simplified_id, article_id, content_simplified, category
            FROM simplified_articles
            WHERE status='approved'
        """)
        return cur.fetchall()

def build_simplified_vectors():
    items = load_simplified_from_db()

    vectors = []
    meta = []

    print(f"🚀 Building SIMPLIFIED vector store for {len(items)} items...")

    for item in items:
        text = item["content_simplified"]
        emb = get_local_embedding(text)

        if emb is None:
            continue

        vectors.append(emb)

        meta.append({
            "id": f"simplified_{item['simplified_id']}",
            "simplified_id": item["simplified_id"],
            "article_id": item["article_id"],
            "category": item["category"],
            "text": text
        })

    vectors = np.array(vectors, dtype=np.float32)

    np.save(OUT_DIR / "vectors.npy", vectors)
    with open(OUT_DIR / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"DONE: {len(vectors)} simplified embeddings saved!")


if __name__ == "__main__":
    build_simplified_vectors()
