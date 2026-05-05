from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import json
import os
import re
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

DATA_FILE = "data.json"

# 🟣 Create file if not exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)


@app.route('/')
def home():
    return "NyayaSetu Backend Running"


# 🟣 SAFE READ
def read_data():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return []


# 🟣 SAFE WRITE
def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


# 🟣 UPLOAD + AI EXTRACTION
@app.route('/upload', methods=['POST'])
def upload():

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files['file']
    text = ""

    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        return jsonify({"error": "PDF read failed"})

    # -------- AI LOGIC --------
    case_title = "Not Found"
    date = "Not Found"
    key_direction = "Not Found"

    # 🔹 Case Title (improved regex)
    match = re.search(r"([A-Z][A-Za-z\s]+v[s\.]*\s+[A-Z][A-Za-z\s]+)", text, re.IGNORECASE)
    if match:
        case_title = match.group(1).strip()

    # 🔹 Date extraction (multiple formats)
    date_patterns = [
        r"\d{1,2} \w+ \d{4}",
        r"\d{1,2}/\d{1,2}/\d{4}",
        r"\d{4}-\d{2}-\d{2}"
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date = match.group(0)
            break

    # 🔹 Key Direction (smart scan)
    priority_words = ["ordered", "directed", "shall", "must", "hereby"]

    lines = text.split("\n")
    for line in lines:
        if any(word in line.lower() for word in priority_words):
            key_direction = line.strip()
            break

    # fallback
    if key_direction == "Not Found" and lines:
        key_direction = lines[-1].strip()

    # -------- DYNAMIC CONFIDENCE --------
    score = 0
    explanation = []

    if case_title != "Not Found":
        score += 30
        explanation.append("Case title detected")

    if date != "Not Found":
        score += 30
        explanation.append("Date detected")

    if key_direction != "Not Found":
        score += 30
        explanation.append("Key direction detected")

    if len(text) > 1000:
        score += 10
        explanation.append("Sufficient document length")

    confidence = str(min(score, 100)) + "%"

    # -------- FINAL RESULT --------
    result = {
        "id": str(uuid.uuid4())[:8],
        "file_name": file.filename,
        "case_title": case_title,
        "date": date,
        "key_direction": key_direction,
        "confidence": confidence,
        "confidence_explanation": explanation,   # 🔥 NEW FEATURE
        "status": "Pending",
        "timestamp": datetime.now().strftime("%d-%m-%Y %H:%M")
    }

    return jsonify(result)


# 🟣 APPROVE
@app.route('/approve', methods=['POST'])
def approve():
    data = request.json
    data["status"] = "Approved"

    cases = read_data()
    cases.append(data)
    write_data(cases)

    return jsonify({"message": "Saved"})


# 🟣 REJECT
@app.route('/reject', methods=['POST'])
def reject():
    data = request.json
    data["status"] = "Rejected"

    cases = read_data()
    cases.append(data)
    write_data(cases)

    return jsonify({"message": "Rejected"})


# 🟣 GET CASES
@app.route('/cases', methods=['GET'])
def get_cases():
    return jsonify(read_data())


if __name__ == '__main__':
    app.run(debug=True)
    # -------- AI SUMMARY (1-LINE) --------
summary = "Summary not available"

for line in lines:
    clean_line = line.strip()

    # pick meaningful sentence
    if (
        len(clean_line) > 40 and
        any(word in clean_line.lower() for word in ["order", "direct", "shall", "must", "allowed", "dismissed"])
    ):
        summary = clean_line
        break

# fallback
if summary == "Summary not available" and key_direction != "Not Found":
    summary = key_direction
    result = {
    "id": str(uuid.uuid4())[:8],
    "file_name": file.filename,
    "case_title": case_title,
    "date": date,
    "key_direction": key_direction,
    "summary": summary,  # 🔥 NEW
    "confidence": confidence,
    "confidence_explanation": explanation,
    "status": "Pending",
    "timestamp": datetime.now().strftime("%d-%m-%Y %H:%M")
}