# ai/bm25_index.py
from pathlib import Path
import json
from typing import Dict, List, Any
from rank_bm25 import BM25Okapi
import pickle
import os
import json
DATA_DIR = Path(__file__).resolve().parents[1] / "vector_store"
INDEX_DIR = Path(__file__).resolve().parents[1] / "bm25_index"
INDEX_DIR.mkdir(exist_ok=True)


def tokenize(text: str) -> List[str]:
    """
    Tạm thời split theo khoảng trắng.
    Sau này có thể thay bằng tokenizer tiếng Việt tốt hơn.
    """
    return (text or "").lower().split()


def _load_meta(source: str) -> List[Dict[str, Any]]:
    meta_path = DATA_DIR / source / "meta.json"
    # Thêm 3 dòng này để kiểm tra file, không có thì bỏ qua an toàn
    if not os.path.exists(meta_path):
        print(f"[BM25] Bỏ qua {source} vì không tìm thấy meta.json")
        return []
    with open(meta_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Tạo tên file BM25 an toàn
def _index_filename(source: str):
    # "articles/chunks" -> "articles_chunks_bm25.pkl"
    safe = source.replace("/", "_")
    return INDEX_DIR / f"{safe}_bm25.pkl"


def build_bm25_for_source(source: str):
    meta = _load_meta(source)

    # Nếu nguồn không có dữ liệu thì bỏ qua
    if not meta:
        print(f"[BM25] Skip {source} (no documents)")
        return

    corpus_tokens: List[List[str]] = []
    ids: List[str] = []

    for idx, item in enumerate(meta):
        # Đảm bảo có id
        if "id" not in item:
            item["id"] = f"{source}_{idx}"

        text = item.get("text") or item.get("content") or ""
        tokens = item.get("tokens") or tokenize(text)

        corpus_tokens.append(tokens)
        ids.append(item["id"])
        item["tokens"] = tokens

    # Lưu lại meta.json với token đã thêm
    meta_path = DATA_DIR / source / "meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    if len(corpus_tokens) == 0:
        print(f"[BM25] Skip {source} (empty corpus)")
        return

    bm25 = BM25Okapi(corpus_tokens)

    # Dùng tên file an toàn
    with open(_index_filename(source), "wb") as f:
        pickle.dump({"bm25": bm25, "ids": ids}, f)

    print(f"[BM25] Built index for {source}: {len(ids)} docs")


def build_all_bm25():
    sources = [
        "articles",
        "articles/chunks",     # thêm mới
        "faq",
        "simplified"
    ]

    for src in sources:
        build_bm25_for_source(src)


def bm25_search(source: str, query: str, top_k: int = 50) -> List[Dict[str, Any]]:
    # Tự động dùng file index an toàn
    with open(_index_filename(source), "rb") as f:
        data = pickle.load(f)

    bm25: BM25Okapi = data["bm25"]
    ids: List[str] = data["ids"]

    tokens = tokenize(query)
    scores = bm25.get_scores(tokens)
    ranked = sorted(zip(ids, scores), key=lambda x: x[1], reverse=True)[:top_k]

    return [{"id": doc_id, "bm25_score": float(score)} for doc_id, score in ranked]


if __name__ == "__main__":
    build_all_bm25()
