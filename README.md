# Nyaya-Setu
AI Legal Decision Support System
# NyayaSetu ⚖️

NyayaSetu is a small project I built for a hackathon to solve a real problem in government and legal systems.

## What this project does

Usually, court judgments come in PDF format and they are very long. It takes a lot of time to read and understand what action needs to be taken.

So I created NyayaSetu, which helps in:

* Uploading a court judgment PDF
* Extracting important details like case title, date, and key order
* Showing a short summary of the decision
* Giving a confidence score based on extraction

## Features

* Upload PDF and preview it
* Automatic extraction of important data
* One-line summary of judgment
* Approve / Reject / Edit option
* Dashboard to store and view cases
* Basic chart for analysis
* Multi-language (English, Hindi, Kannada)

## Tech Used

* HTML, CSS, JavaScript (Frontend)
* Python Flask (Backend)
* pdfplumber (for reading PDF)
* Simple regex logic for extraction

## How to run

1. Go to backend folder

2. Install dependencies:
   pip install flask flask-cors pdfplumber

3. Run server:
   python app.py

4. Open upload.html in browser

5. Upload any PDF and test

## Why I made this

I wanted to build something useful for real-world government systems. This project shows how AI can reduce manual work and help in faster decision making.

## Future Improvements

* Better AI model instead of basic logic
* OCR for scanned PDFs
* More accurate summary generation
* Online deployment

---

This is my hackathon prototype project .
