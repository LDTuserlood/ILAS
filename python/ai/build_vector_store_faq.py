# ai/build_vector_store_faq.py
import json
import numpy as np
from pathlib import Path
from ai.local_embedder import get_local_embedding
from db_core import get_connection

OUT_DIR = Path("vector_store/faq")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def load_faq_from_db():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT faq_id, question, answer, category
            FROM faq
        """)
        return cur.fetchall()

def build_faq_vectors():
    faq_items = load_faq_from_db()

    vectors = []
    meta = []

    print(f"🚀 Building FAQ vector store for {len(faq_items)} items...")

    for item in faq_items:
        text = f"Q: {item['question']}\nA: {item['answer']}"
        emb = get_local_embedding(text)

        if emb is None:
            continue

        vectors.append(emb)

        meta.append({
            "id": f"faq_{item['faq_id']}",
            "faq_id": item["faq_id"],
            "question": item["question"],
            "answer": item["answer"],
            "category": item["category"],
            "text": text
        })

    vectors = np.array(vectors, dtype=np.float32)

    np.save(OUT_DIR / "vectors.npy", vectors)
    with open(OUT_DIR / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"DONE: {len(vectors)} FAQ embeddings saved!")


if __name__ == "__main__":
    build_faq_vectors()
