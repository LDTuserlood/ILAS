# ai/retrieval_level6.py
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
    "nghi_viec": [35, 36, 48, 56],
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

    # Nghỉ việc – chủ đề quan trọng nhất
    if any(k in q for k in [
        "nghỉ việc", "nghi viec", "thôi việc", "thoi viec",
        "xin nghỉ", "xin nghi", "nghỉ làm", "bo viec"
    ]):
        return "nghi_viec"

    # Báo trước
    if "báo trước" in q or "bao truoc" in q:
        return "bao_truoc"

    # Sa thải
    if any(k in q for k in ["sa thải", "sa thai", "đuổi việc", "duoi viec"]):
        return "sa_thai"

    # Nghỉ 5 ngày
    if "5 ngày" in q or "05 ngày" in q or "5 ngay" in q:
        return "5_ngay"

    # Nghỉ lễ
    if any(k in q for k in ["nghỉ lễ", "nghi le", "lễ", "le"]):
        return "nghi_le"

    # Nghỉ năm
    if any(k in q for k in ["nghỉ năm", "nghi nam", "nghỉ hằng năm", "nghi hang nam", "nghỉ phép"]):
        return "nghi_nam"

    # Ngừng việc
    if any(k in q for k in ["ngừng việc", "ngung viec", "ngừng làm", "ngung lam"]):
        return "ngung_viec"

    # Làm thêm giờ
    if any(k in q for k in ["làm thêm", "lam them", "tăng ca", "tang ca", "làm thêm giờ"]):
        return "lam_them"

    # Thử việc
    if any(k in q for k in ["thử việc", "thu viec"]):
        return "thu_viec"

    return None



# ======================================
# LOAD SOURCE
# ======================================
def load_source(name: str):
    vec_path = DATA_DIR / name / "vectors.npy"
    meta_path = DATA_DIR / name / "meta.json"
    topic_path = DATA_DIR / name / "topic_centroids.npy"

    if not vec_path.exists() or not meta_path.exists():
        return None

    vectors = np.load(vec_path)
    # Guard against empty or 1D vectors that would break cosine_similarity
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


ARTICLES = load_source("articles/chunks") or load_source("articles")
FAQ = load_source("faq")
SIMPLIFIED = load_source("simplified")

SOURCES = [ARTICLES, FAQ, SIMPLIFIED]


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
# RANK SCORE
# ======================================
SOURCE_PRIORITY = {
    "articles/chunks": 0.12,
    "articles": 0.10,
    "faq": 0.05,
    "simplified": 0.02
}


def fusion_rank(query, query_vec, sem_results):
    subject = detect_subject(query)
    fused = []

    for r in sem_results:
        src = r["source"]

        if not is_labor_question(query.lower()):
            if src.startswith("articles"):
                continue

        semantic_score = r["semantic_score"]

        try:
            bm25_res = bm25_search(src, query, top_k=1)
            bm25_score = bm25_res[0]["bm25_score"] if bm25_res else 0.0
        except:
            bm25_score = 0.0

        subject_bonus = subject_score(r["text"], subject)
        topic_boost_score = topic_boost(query.lower(), r["text"].lower())
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

    # FE → internal mapping
    mapping = {
        "laws": "articles/chunks",
        "faqs": "faq",
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

        # Áp dụng FILTER: chỉ lấy đúng nguồn FE yêu cầu
        if selected_source != "all" and source["name"] != selected_source:
            continue

        sem_results += semantic_retrieve(source, query_vec)

    return fusion_rank(query, query_vec, sem_results)