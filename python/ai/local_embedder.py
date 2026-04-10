# ai/local_embedder.py
from sentence_transformers import SentenceTransformer
import numpy as np
import re

MODEL_NAME = "intfloat/multilingual-e5-base"

print(f"🔍 Loading embedding model: {MODEL_NAME} ...")
model = SentenceTransformer(MODEL_NAME)


def clean_text(text: str) -> str:
    """Làm sạch text trước khi embed."""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    # bỏ prefix Điều/Khoản để tránh model bị nhiễu
    text = re.sub(r"Điều\s+\d+\.?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Khoản\s+\d+\.?", "", text, flags=re.IGNORECASE)
    return text.strip()


def get_local_embedding(text: str) -> np.ndarray | None:
    """Embedding 1 câu (giữ lại cho code cũ nếu có dùng)."""
    if not text:
        return None
    text = clean_text(text)
    vec = model.encode([text], batch_size=16, normalize_embeddings=True)[0]
    return np.asarray(vec, dtype=np.float32)


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Embedding nhiều câu cùng lúc – dùng trong RAG Level 4.
    Trả về array shape (N, D).
    """
    if not texts:
        return np.zeros((0, model.get_sentence_embedding_dimension()), dtype=np.float32)

    cleaned = [clean_text(t) for t in texts]
    vecs = model.encode(cleaned, batch_size=16, normalize_embeddings=True)
    return np.asarray(vecs, dtype=np.float32)
