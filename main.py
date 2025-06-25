from dotenv import load_dotenv
load_dotenv()   
from flask import Flask, request, jsonify, send_from_directory
import openai, os, traceback

app = Flask(__name__, static_folder='.')

# Load your key
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_KEY

@app.route("/")
def index():
    return send_from_directory(os.getcwd(), "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True)
        msgs = data.get("messages")
        if not isinstance(msgs, list):
            return jsonify({"error": "messages must be an array"}), 400

        # Use the new v1 API path for chat completions:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=msgs,
            temperature=0.7,
            max_tokens=512,
        )

        answer = resp.choices[0].message.content
        return jsonify({"answer": answer})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e) or "Unknown server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3003, debug=True)
