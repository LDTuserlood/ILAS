import json
import re
import unicodedata
from pathlib import Path

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from ai.local_embedder import get_local_embedding
from db_core import execute_query

DATA_DIR = Path(__file__).resolve().parents[1] / "vector_store"


def normalize_text(value: str) -> str:
    text = unicodedata.normalize("NFD", value or "")
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D")
    text = text.replace("Ä‘", "d").replace("Ä", "D")
    text = text.lower()
    return re.sub(r"\s+", " ", text).strip()


def tokenize(value: str):
    stopwords = {
        "la", "va", "co", "cua", "khi", "thi", "nao", "nhung", "cac", "ve",
        "cho", "toi", "minh", "ban", "duoc", "bi", "trong", "the", "hay",
        "hoi", "can", "phai",
    }
    return [
        token
        for token in re.findall(r"[a-z0-9]+", normalize_text(value))
        if len(token) > 1 and token not in stopwords
    ]


def detect_article_number(query: str):
    match = re.search(r"\bdieu\s+(\d+)\b", normalize_text(query))
    return match.group(1) if match else None


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


def article_result_by_number_in_law(article_number, law_keyword="Viên chức"):
    rows = execute_query(
        """
        SELECT
            a.article_id,
            a.article_number,
            a.article_title,
            a.content,
            l.title AS law_title
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.article_number = %s
          AND a.status = 'active'
          AND l.status = 'active'
          AND LOWER(l.title) LIKE LOWER(%s)
        ORDER BY l.law_id DESC
        LIMIT 1
        """,
        (str(article_number), f"%{law_keyword}%"),
        fetchone=True,
    )
    if not rows:
        return None

    return {
        "id": f"art_{rows['article_id']}",
        "text": (rows.get("content") or "")[:1200],
        "source": "articles",
        "article_id": rows["article_id"],
        "article_number": rows.get("article_number"),
        "law_title": rows.get("article_title"),
        "semantic_score": 0.0,
        "lexical_score": 999.0,
        "final_score": 999.0,
    }


def detect_intent(query: str):
    q = normalize_text(query)

    is_public_employee = (
        any(k in q for k in ["vien chuc", "quan chuc", "cong chuc"])
        or ("nghia vu" in q and "nha nuoc" in q)
        or ("thich lam gi" in q and "nha nuoc" in q)
    )

    if is_public_employee:
        if any(k in q for k in ["mien giam", "mien", "giam", "loai tru trach nhiem"]):
            return "vien_chuc_mien_giam"
        if any(k in q for k in ["danh gia", "xep loai", "chat luong"]):
            return "vien_chuc_danh_gia"
        if any(k in q for k in ["dao tao", "boi duong"]):
            return "vien_chuc_dao_tao"
        if any(k in q for k in ["khong duoc lam", "cam", "khong lam theo", "khong thuc hien", "ky luat", "thich lam gi"]):
            return "vien_chuc_cam_ky_luat"
        if "nghia vu" in q:
            return "vien_chuc_nghia_vu"
        if "quyen" in q and any(k in q for k in ["nghe nghiep", "hoat dong nghe nghiep"]):
            return "vien_chuc_quyen_nghe_nghiep"
        if "quyen" in q:
            return "vien_chuc_quyen"

    if any(k in q for k in ["nghi viec", "thoi viec", "xin nghi", "nghi lam", "bo viec"]):
        return "nghi_viec"
    if "bao truoc" in q:
        return "bao_truoc"
    if any(k in q for k in ["sa thai", "duoi viec"]):
        return "sa_thai"
    if any(k in q for k in ["5 ngay", "05 ngay"]):
        return "5_ngay"
    if any(k in q for k in ["nghi le", "le tet"]):
        return "nghi_le"
    if any(k in q for k in ["nghi nam", "nghi hang nam", "nghi phep"]):
        return "nghi_nam"
    if any(k in q for k in ["ngung viec", "ngung lam"]):
        return "ngung_viec"
    if any(k in q for k in ["lam them", "tang ca", "lam them gio"]):
        return "lam_them"
    if "thu viec" in q:
        return "thu_viec"

    return None


VIEN_CHUC_INTENT_TO_ARTICLE = {
    "vien_chuc_nghia_vu": 7,
    "vien_chuc_cam_ky_luat": 10,
    "vien_chuc_mien_giam": 34,
    "vien_chuc_danh_gia": 25,
    "vien_chuc_dao_tao": 28,
    "vien_chuc_quyen_nghe_nghiep": 11,
    "vien_chuc_quyen": 11,
}


def load_source(name: str):
    vec_path = DATA_DIR / name / "vectors.npy"
    meta_path = DATA_DIR / name / "meta.json"
    topic_path = DATA_DIR / name / "topic_centroids.npy"

    if not vec_path.exists() or not meta_path.exists():
        return None

    vectors = np.load(vec_path)
    if vectors.size == 0 or vectors.ndim != 2:
        print(f"[RAG] SKIP {name} -> invalid vectors shape {vectors.shape}")
        return None

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    if len(vectors) != len(meta):
        print(f"[RAG] SKIP {name} -> vectors/meta mismatch {len(vectors)} vs {len(meta)}")
        return None

    topic_centroids = np.load(topic_path) if topic_path.exists() else None

    return {
        "name": name,
        "vectors": vectors,
        "meta": meta,
        "topic_centroids": topic_centroids,
    }


ARTICLES = None
ARTICLES_CHUNKS = None
SIMPLIFIED = None
SOURCES = []


def reload_sources():
    global ARTICLES, ARTICLES_CHUNKS, SIMPLIFIED, SOURCES

    ARTICLES = load_source("articles")
    ARTICLES_CHUNKS = load_source("articles/chunks")
    SIMPLIFIED = load_source("simplified")
    SOURCES = list(filter(None, [ARTICLES, ARTICLES_CHUNKS, SIMPLIFIED]))

    loaded = [source["name"] for source in SOURCES]
    print(f"[RAG] Reloaded sources: {', '.join(loaded) if loaded else 'none'}")
    return {
        "loaded": loaded,
        "totalSources": len(SOURCES),
    }


reload_sources()


def semantic_retrieve(source, query_vec, top_k=40):
    if source is None:
        return []

    sims = cosine_similarity([query_vec], source["vectors"])[0]
    idxs = np.argsort(sims)[::-1][:top_k]

    results = []
    for i in idxs:
        meta = source["meta"][i]
        results.append({
            "id": meta.get("id"),
            "text": meta.get("text", ""),
            "source": source["name"],
            "article_id": meta.get("article_id"),
            "article_number": meta.get("article_number"),
            "clause_number": meta.get("clause_number"),
            "law_title": meta.get("law_title"),
            "semantic_score": float(sims[i]),
            "topic_cluster": meta.get("topic_cluster"),
        })
    return results


def detect_subject(query):
    q = normalize_text(query)
    if any(w in q for w in ["toi", "em", "nguoi lao dong", "nhan vien"]):
        return "nld"
    if any(w in q for w in ["cong ty", "doanh nghiep", "sep", "quan ly"]):
        return "nsdld"
    return "unknown"


def subject_score(text, subject):
    t = normalize_text(text)
    if subject == "nld" and "nguoi lao dong" in t:
        return 0.10
    if subject == "nsdld" and "nguoi su dung lao dong" in t:
        return 0.10
    return 0.0


SOURCE_PRIORITY = {
    "articles/chunks": 0.12,
    "articles": 0.10,
    "simplified": 0.02,
}


def lexical_score(query: str, result: dict) -> float:
    q_norm = normalize_text(query)
    title_norm = normalize_text(result.get("law_title") or "")
    text_norm = normalize_text(result.get("text") or "")
    haystack = f"{title_norm} {text_norm}"

    query_tokens = set(tokenize(query))
    if not query_tokens:
        return 0.0

    hay_tokens = set(tokenize(haystack))
    title_tokens = set(tokenize(title_norm))
    overlap = len(query_tokens & hay_tokens) / max(len(query_tokens), 1)
    score = overlap * 0.55

    title_overlap = len(query_tokens & title_tokens) / max(len(query_tokens), 1)
    score += title_overlap * 0.75

    important_phrases = [
        "nganh nghe cam dau tu kinh doanh",
        "cam dau tu kinh doanh",
        "nganh nghe cam",
        "dau tu kinh doanh",
        "co y gay thuong tich",
        "xam pham suc khoe",
        "xam hai suc khoe",
        "xu ly vi pham hanh chinh",
        "boi thuong thiet hai do suc khoe",
        "tien luong",
        "tra luong",
        "thanh toan tien luong",
        "cham dut hop dong lao dong",
        "nghia vu khi cham dut hop dong lao dong",
    ]
    for phrase in important_phrases:
        if phrase in q_norm and phrase in haystack:
            score += 0.65 if phrase in title_norm else 0.30

    if title_norm and any(token in title_norm for token in query_tokens):
        score += 0.12

    critical_terms = {"cam", "nganh", "nghe", "dau", "tu", "kinh", "doanh"}
    if critical_terms.issubset(query_tokens) and critical_terms.issubset(title_tokens):
        score += 1.20
    elif "cam" in query_tokens and "cam" in title_tokens:
        score += 0.55
    elif "cam" in query_tokens and "cam" not in title_tokens:
        score -= 0.20

    return score


def keyword_retrieve(query: str, top_k=8):
    query_tokens = set(tokenize(query))
    if not query_tokens:
        return []

    rows = execute_query(
        """
        SELECT
            a.article_id,
            a.article_number,
            a.article_title,
            a.content,
            l.title AS law_title
        FROM articles a
        JOIN laws l ON a.law_id = l.law_id
        WHERE a.status = 'active' AND l.status = 'active'
        """,
        fetchall=True,
    ) or []

    ranked = []
    for row in rows:
        title = row.get("article_title") or ""
        law_title = row.get("law_title") or ""
        content = row.get("content") or ""

        title_tokens = set(tokenize(title))
        law_tokens = set(tokenize(law_title))
        content_tokens = set(tokenize(content[:2500]))

        title_overlap = len(query_tokens & title_tokens)
        law_overlap = len(query_tokens & law_tokens)
        content_overlap = len(query_tokens & content_tokens)

        score = (
            title_overlap * 1.4
            + law_overlap * 0.6
            + content_overlap * 0.35
        )

        q_norm = normalize_text(query)
        title_norm = normalize_text(title)
        content_norm = normalize_text(content)
        law_norm = normalize_text(law_title)
        haystack = f"{law_norm} {title_norm} {content_norm}"

        phrases = [
            "tro cap thoi viec",
            "nguyen tac chan nuoi",
            "tu do bao chi",
            "chong nha nuoc",
            "chong pha nha nuoc",
            "hanh vi bi nghiem cam",
            "dau tu kinh doanh",
            "nganh nghe cam dau tu kinh doanh",
            "co y gay thuong tich",
            "xam pham suc khoe",
            "xam hai suc khoe",
            "xu ly vi pham hanh chinh",
            "boi thuong thiet hai do suc khoe",
            "tien luong",
            "tra luong",
            "thanh toan tien luong",
            "cham dut hop dong lao dong",
            "nghia vu khi cham dut hop dong lao dong",
        ]
        for phrase in phrases:
            if phrase in q_norm and phrase in haystack:
                score += 4.0 if phrase in title_norm else 2.0

        if "chong" in query_tokens and "nha" in query_tokens and "nuoc" in query_tokens:
            if row.get("article_number") == "8" and "bao chi" in law_norm:
                score += 4.0

        if score > 0:
            ranked.append({
                "id": f"art_{row['article_id']}",
                "text": content[:1200],
                "source": "articles",
                "article_id": row["article_id"],
                "article_number": row.get("article_number"),
                "law_title": title,
                "semantic_score": 0.0,
                "lexical_score": score,
                "final_score": score,
            })

    ranked.sort(key=lambda item: item["final_score"], reverse=True)
    return ranked[:top_k]


def fusion_rank(query, query_vec, sem_results):
    subject = detect_subject(query)
    fused = []

    for result in sem_results:
        semantic = result.get("semantic_score", 0.0)
        lexical = lexical_score(query, result)
        final_score = (
            0.70 * semantic
            + lexical
            + subject_score(result.get("text", ""), subject)
            + SOURCE_PRIORITY.get(result.get("source"), 0.0)
        )
        fused.append({**result, "lexical_score": lexical, "final_score": final_score})

    return sorted(fused, key=lambda x: x["final_score"], reverse=True)[:15]


def retrieve_multi_source(query: str, source_filter="all"):
    mapping = {
        "laws": "articles/chunks",
        "content": "simplified",
        "all": "all",
    }
    selected_source = mapping.get(source_filter, "all")

    article_no = detect_article_number(query)
    if article_no:
        print(f"DIRECT ARTICLE MATCH: Dieu {article_no}")
        return [{
            "article_number": article_no,
            "source": "articles",
            "text": "",
            "final_score": 999,
        }]

    intent = detect_intent(query)
    if intent:
        if intent in VIEN_CHUC_INTENT_TO_ARTICLE:
            article_number = VIEN_CHUC_INTENT_TO_ARTICLE[intent]
            print(f"INTENT MATCH: {intent} -> Luat Vien chuc Dieu {article_number}")
            article_result = article_result_by_number_in_law(article_number, "Viên chức")
            if article_result:
                return [article_result]

        article_number = INTENT_TO_ARTICLES[intent][0]
        print(f"INTENT MATCH: {intent} -> Dieu {article_number}")
        keyword_results = keyword_retrieve(query)
        if keyword_results:
            return keyword_results
        return [{
            "article_number": str(article_number),
            "source": "articles",
            "text": "",
            "final_score": 999,
        }]

    keyword_results = keyword_retrieve(query)
    if keyword_results and keyword_results[0].get("final_score", 0) >= 2.0:
        return keyword_results

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
