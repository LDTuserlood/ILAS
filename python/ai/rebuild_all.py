import os
import subprocess
import sys


def rebuild_env():
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    return env


def run(module_name):
    cmd = [sys.executable, "-m", module_name]
    print(f"[REBUILD] RUNNING: {' '.join(cmd)}", flush=True)
    completed = subprocess.run(
        cmd,
        shell=False,
        env=rebuild_env(),
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if completed.returncode != 0:
        raise RuntimeError(f"{module_name} failed with exit code {completed.returncode}")


if __name__ == "__main__":
    os.environ.update(rebuild_env())
    print("[REBUILD] REBUILDING ALL AI COMPONENTS...", flush=True)

    run("ai.build_vector_store_chunks")
    run("ai.build_vector_store_simplified")
    run("ai.bm25_index")
    run("ai.topic_cluster_builder")

    print("[REBUILD] DONE! ALL MODELS & INDEXES REBUILT SUCCESSFULLY.", flush=True)
