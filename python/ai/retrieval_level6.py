import numpy as np
from pathlib import Path
import json
import re
from sklearn.metrics.pairwise import cosine_similarity

from ai.local_embedder import get_local_embedding
from ai.bm25_index import bm25_search
from ai.legal_topic_boost import topic_boost, is_labor_question

DATA_DIR = Path(__file__).resolve().parents[1] / "vector_store"


# ======================================
# 1) DETECT ARTICLE NUMBER
# ======================================
def detect_article_number(query: str):
    q = query.lower()
    m = re.search(r"điều\s+(\d+)", q)
    if m:
        return m.group(1)
    return None


# ======================================
# 2) INTENT ROUTING – TỐI ƯU NHẤT
# ======================================
INTENT_TO_ARTICLES = {
    "nghi_viec": [35, 36, 46, 47, 48, 56],
    "bao_truoc": [35],
    "sa_thai": [125],
    "5_ngay": [125],
    "nghi_le": [112],
    "nghi_nam": [113],
    "ngung_viec": [99],
    "lam_them": [98],
    "thu_viec": [25, 26],
}


def detect_intent(query: str):
    q = query.lower()

    if any(k in q for k in ["nghỉ việc", "nghi viec", "thôi việc", "thoi viec", "xin nghỉ", "xin nghi", "nghỉ làm", "bo viec"]):
        return "nghi_viec"
    if "báo trước" in q or "bao truoc" in q:
        return "bao_truoc"
    if any(k in q for k in ["sa thải", "sa thai", "đuổi việc", "duoi viec"]):
        return "sa_thai"
    if "5 ngày" in q or "05 ngày" in q or "5 ngay" in q:
        return "5_ngay"
    if any(k in q for k in ["nghỉ lễ", "nghi le", "lễ", "le"]):
        return "nghi_le"
    if any(k in q for k in ["nghỉ năm", "nghi nam", "nghỉ hằng năm", "nghi hang nam", "nghỉ phép"]):
        return "nghi_nam"
    if any(k in q for k in ["ngừng việc", "ngung viec", "ngừng làm", "ngung lam"]):
        return "ngung_viec"
    if any(k in q for k in ["làm thêm", "lam them", "tăng ca", "tang ca", "làm thêm giờ"]):
        return "lam_them"
    if any(k in q for k in ["thử việc", "thu viec"]):
        return "thu_viec"

    return None


# ======================================
# LOAD SOURCE (ĐÃ SỬA CHUẨN)
# ======================================
def load_source(name: str):
    vec_path = DATA_DIR / name / "vectors.npy"
    meta_path = DATA_DIR / name / "meta.json"
    topic_path = DATA_DIR / name / "topic_centroids.npy"

    if not vec_path.exists() or not meta_path.exists():
        return None

    vectors = np.load(vec_path)
    if vectors.size == 0 or vectors.ndim != 2:
        print(f"[RAG] SKIP {name} → invalid vectors shape {vectors.shape}")
        return None

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    if len(vectors) != len(meta):
        print(f"[RAG] SKIP {name} → vectors/meta mismatch {len(vectors)} vs {len(meta)}")
        return None

    topic_centroids = np.load(topic_path) if topic_path.exists() else None

    return {
        "name": name,
        "vectors": vectors,
        "meta": meta,
        "topic_centroids": topic_centroids
    }

# BẢN VÁ SỐ 1: Tải đủ 3 nguồn độc lập thay vì gộp chung
ARTICLES = load_source("articles")
ARTICLES_CHUNKS = load_source("articles/chunks")
SIMPLIFIED = load_source("simplified")

# Lọc bỏ những nguồn bị None
SOURCES = list(filter(None, [ARTICLES, ARTICLES_CHUNKS, SIMPLIFIED]))


def get_source_by_name(name: str):
    for s in SOURCES:
        if s and s["name"] == name:
            return s
    return None


# ======================================
# SEMANTIC SEARCH
# ======================================
def semantic_retrieve(source, query_vec, top_k=20):
    if source is None:
        return []

    sims = cosine_similarity([query_vec], source["vectors"])[0]
    idxs = np.argsort(sims)[::-1][:top_k]

    meta = source["meta"]
    results = []
    for i in idxs:
        results.append({
            "id": meta[i]["id"],
            "text": meta[i]["text"],
            "source": source["name"],
            "article_id": meta[i].get("article_id"), # THÊM DÒNG NÀY ĐỂ TRÁNH LỖI CONTEXT BUILDER
            "article_number": meta[i].get("article_number"),
            "clause_number": meta[i].get("clause_number"),
            "law_title": meta[i].get("law_title"),
            "semantic_score": float(sims[i]),
            "topic_cluster": meta[i].get("topic_cluster", None)
        })
    return results


# ======================================
# SUBJECT
# ======================================
def detect_subject(query):
    q = query.lower()
    nld = ["tôi", "em", "người lao động", "nhân viên"]
    nsdld = ["công ty", "doanh nghiệp", "sếp", "quản lý"]

    for w in nld:
        if w in q:
            return "nld"
    for w in nsdld:
        if w in q:
            return "nsdld"
    return "unknown"


def subject_score(text, subject):
    t = text.lower()
    if subject == "nld" and "người lao động" in t:
        return 0.1
    if subject == "nsdld" and "người sử dụng lao động" in t:
        return 0.1
    return 0.0


# ======================================
# RANK SCORE (ĐÃ VÁ LỖI)
# ======================================
SOURCE_PRIORITY = {
    "articles/chunks": 0.12,
    "articles": 0.10,
    "simplified": 0.02
}


def fusion_rank(query, query_vec, sem_results):
    subject = detect_subject(query)
    fused = []

    for r in sem_results:
        src = r["source"]

        # BẢN VÁ SỐ 2: ĐÃ XÓA BỎ LỆNH CẤM LUẬT THI HÀNH Ở ĐÂY
        # Hệ thống giờ đây sẽ nhận diện mọi bộ luật một cách bình đẳng.

        semantic_score = r["semantic_score"]

        try:
            bm25_res = bm25_search(src, query, top_k=1)
            bm25_score = bm25_res[0]["bm25_score"] if bm25_res else 0.0
        except:
            bm25_score = 0.0

        subject_bonus = subject_score(r["text"], subject)
        topic_boost_score = 0.0
        priority = SOURCE_PRIORITY.get(src, 0.0)

        final_score = (
            0.55 * semantic_score +
            0.20 * bm25_score +
            subject_bonus +
            topic_boost_score +
            priority
        )

        fused.append({**r, "bm25_score": bm25_score, "final_score": final_score})

    fused = sorted(fused, key=lambda x: x["final_score"], reverse=True)
    return fused[:15]


# ======================================
# MAIN RETRIEVAL
# ======================================
def retrieve_multi_source(query: str, source_filter="all"):

    mapping = {
        "laws": "articles/chunks",
        "content": "simplified",
        "all": "all"
    }

    selected_source = mapping.get(source_filter, "all")

    # 1️⃣ Điều X
    article_no = detect_article_number(query)
    if article_no:
        print(f"🔥 DIRECT ARTICLE MATCH: Điều {article_no}")
        return [{
            "article_number": article_no,
            "source": "articles",
            "text": "",
            "final_score": 999
        }]

    # 2️⃣ Intent
    intent = detect_intent(query)
    if intent:
        art = INTENT_TO_ARTICLES[intent][0]
        print(f"🔥 INTENT MATCH: {intent} -> Điều {art}")
        return [{
            "article_number": str(art),
            "source": "articles",
            "text": "",
            "final_score": 999
        }]

    # 3️⃣ Normal Retrieval
    query_vec = get_local_embedding(query)
    sem_results = []

    for source in SOURCES:
        if not source:
            continue

        if selected_source != "all" and source["name"] != selected_source:
            if not (selected_source == "articles/chunks" and source["name"] == "articles"):
                continue

        sem_results += semantic_retrieve(source, query_vec)

    return fusion_rank(query, query_vec, sem_results)