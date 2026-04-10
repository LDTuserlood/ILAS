from flask import Flask, request, jsonify
from flask_cors import CORS
from ai.legal_rag_pipeline import answer_legal_question
import subprocess

app = Flask(__name__)
CORS(app)


# AI ANSWER ENDPOINT
@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.get_json(force=True)

    question = data.get("question", "").strip()
    settings = data.get("settings", {})   # <-- nhận settings từ backend

    if not question:
        return jsonify({"error": "Missing 'question' field"}), 400

    print("\n🔥 NEW AI REQUEST")
    print("QUESTION:", question)
    print("SETTINGS:", settings)

    try:
        result = answer_legal_question(question, settings)
        return jsonify(result), 200

    except Exception as e:
        print("❌ AI SERVER ERROR:", e)
        return jsonify({
            "answer": "⚠️ AI Server gặp lỗi nội bộ.",
            "error": str(e)
        }), 500

# REBUILD VECTOR + BM25 + TOPIC CLUSTERS
@app.route("/api/admin/rebuild", methods=["POST"])
def rebuild():
    try:
        subprocess.Popen(["python", "ai/rebuild_all.py"])
        print("🚀 REBUILD STARTED in background!")
        return jsonify({"message": "Rebuild started"}), 200

    except Exception as e:
        print("❌ REBUILD FAILED:", e)
        return jsonify({"error": str(e)}), 500

# RUN SERVER
if __name__ == "__main__":
    print("🚀 AI Server is running at http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
