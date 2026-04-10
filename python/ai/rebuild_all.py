import os
import subprocess

def run(cmd):
    print(f"⚙️ RUNNING: {cmd}")
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    print("🚀 REBUILDING ALL AI COMPONENTS...")

    # 1) Build vector store
    run("python -m ai.build_vector_store_chunks")
    run("python -m ai.build_vector_store_faq")
    run("python -m ai.build_vector_store_simplified")

    # 2) Build BM25
    run("python -m ai.bm25_index")

    # 3) Build topic clusters
    run("python -m ai.topic_cluster_builder")

    print("🎉 DONE! ALL MODELS & INDEXES REBUILT SUCCESSFULLY.")
