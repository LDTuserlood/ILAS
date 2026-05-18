from flask import Flask, request, jsonify
from flask_cors import CORS
from ai.legal_rag_pipeline import answer_legal_question
from ai.retrieval_level6 import reload_sources
import os
import subprocess
import sys

app = Flask(__name__)
CORS(app)


@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.get_json(force=True)

    question = data.get("question", "").strip()
    settings = data.get("settings", {})
    history = data.get("history", [])

    if not question:
        return jsonify({"error": "Missing 'question' field"}), 400

    print("\nNEW AI REQUEST")
    print("QUESTION:", question)
    print("SETTINGS:", settings)

    try:
        result = answer_legal_question(question, settings, history=history)
        return jsonify(result), 200
    except Exception as e:
        print("AI SERVER ERROR:", e)
        return jsonify({
            "answer": "AI Server gap loi noi bo.",
            "error": str(e),
        }), 500


@app.route("/api/admin/rebuild", methods=["POST"])
@app.route("/api/admin/rebuid", methods=["POST"])
def rebuild():
    try:
        print("REBUILD STARTED!")
        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"
        env["PYTHONIOENCODING"] = "utf-8"
        completed = subprocess.run(
            [sys.executable, "-m", "ai.rebuild_all"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        logs = "\n".join(part for part in [completed.stdout, completed.stderr] if part)

        if completed.returncode != 0:
            print("REBUILD FAILED")
            return jsonify({
                "message": "Rebuild failed",
                "exitCode": completed.returncode,
                "logs": logs,
            }), 500

        reload_info = reload_sources()

        print("REBUILD DONE!")
        return jsonify({
            "message": "Rebuild completed",
            "exitCode": completed.returncode,
            "logs": logs,
            "reload": reload_info,
        }), 200
    except Exception as e:
        print("REBUILD FAILED:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/reload", methods=["POST"])
def reload_ai_data():
    try:
        reload_info = reload_sources()
        return jsonify({
            "message": "AI data reloaded",
            "reload": reload_info,
        }), 200
    except Exception as e:
        print("RELOAD FAILED:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("AI Server is running at http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
