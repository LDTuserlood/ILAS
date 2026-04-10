# ai/topic_cluster_builder.py (LEVEL 7 READY)
from pathlib import Path
import json
import numpy as np
from sklearn.cluster import KMeans

DATA_DIR = Path(__file__).resolve().parents[1] / "vector_store"

# NOW INCLUDES CHUNKS!
SUPPORTED_SOURCES = [
    "articles",
    "articles/chunks",   # NEW: chunk-level topic clustering
    "faq",
    "simplified"
]

# SAFE LOADER
def _load_vectors_and_meta(source: str):
    vec_path = DATA_DIR / source / "vectors.npy"
    meta_path = DATA_DIR / source / "meta.json"

    if not vec_path.exists() or not meta_path.exists():
        print(f"[Topic] SKIP {source} → missing vectors/meta.json")
        return None

    try:
        vectors = np.load(vec_path)
    except Exception as e:
        print(f"[Topic] ERROR loading vectors for {source}: {e}")
        return None

    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except Exception as e:
        print(f"[Topic] ERROR loading meta.json for {source}: {e}")
        return None

    if len(meta) == 0 or len(vectors) == 0:
        print(f"[Topic] SKIP {source} → empty dataset")
        return None

    if len(vectors) != len(meta):
        print(f"[Topic] MISMATCH {source}: {len(vectors)} vectors vs {len(meta)} meta")
        return None

    return vectors, meta, meta_path

# SMART CLUSTER COUNT
def _determine_cluster_count(num_samples, base_clusters=8):
    if num_samples < 5:
        return 1
    if num_samples < base_clusters:
        return max(1, num_samples // 2)
    if num_samples > 5000:
        return 12
    if num_samples > 10000:
        return 16
    return base_clusters

# MAIN BUILD FUNCTION
def build_topic_clusters_for_source(source: str, n_clusters: int = 8):
    loaded = _load_vectors_and_meta(source)
    if loaded is None:
        return

    vectors, meta, meta_path = loaded
    n_clusters = _determine_cluster_count(len(vectors), n_clusters)

    print(f"[Topic] Building clusters for {source} → {n_clusters} clusters, {len(vectors)} samples")

    try:
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init="auto"
        )
        labels = kmeans.fit_predict(vectors)
    except Exception as e:
        print(f"[Topic] ERROR KMeans for {source}: {e}")
        return

    for item, label in zip(meta, labels):
        item["topic_cluster"] = int(label)

    # Save updated meta
    try:
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Topic] ERROR saving meta.json for {source}: {e}")

    # Save centroids
    centroids_path = DATA_DIR / source / "topic_centroids.npy"
    try:
        np.save(centroids_path, kmeans.cluster_centers_)
    except Exception as e:
        print(f"[Topic] ERROR saving centroids for {source}: {e}")

    print(f"[Topic] DONE → {source} clustered ✓")

# RUN ALL SOURCES
def build_all_topics():
    print("🚀 Starting topic clustering...\n")

    for src in SUPPORTED_SOURCES:
        build_topic_clusters_for_source(src, n_clusters=8)

    print("\n🎉 Topic clustering completed!")


if __name__ == "__main__":
    build_all_topics()
