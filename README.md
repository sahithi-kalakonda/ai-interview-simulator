# 🎤 AI Voice Interview Simulator

A smart, voice-enabled web application that simulates real technical interviews. Powered by OpenRouter (LLMs) and React + FastAPI, this app lets users upload their resume, respond to questions via voice, and receive intelligent feedback like a real interviewer.

---

## 🚀 Features

- 🎯 **Role-specific interviews**: Choose roles like Frontend, Backend, Cloud Architect, or Data Analyst
- 📄 **Resume-aware questions**: Upload a resume (PDF/TXT) to personalize interview questions
- 🎤 **Voice answers**: Record audio answers using your mic and send them
- 🧠 **LLM feedback**: Get real-time AI feedback + follow-up questions
- 💬 **Chat memory**: Maintains conversation context for deeper interactions

---

## 🧱 Tech Stack

| Layer      | Tools                                |
|------------|---------------------------------------|
| Frontend   | React, Axios, Mic-Recorder-to-MP3     |
| Backend    | FastAPI, OpenRouter API, PDFMiner     |
| AI Models  | Mistral 7B via OpenRouter             |

---

## 🖼 UI Overview

- Upload resume → Start interview
- Voice-record your answer → Submit
- View AI feedback + next question

---

## 📦 Setup Instructions

### 🖥 Frontend

```bash
cd frontend
npm install
npm start

cd backend
python -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Create a .env in the backend/ folder:
OPENROUTER_API_KEY=your_openrouter_api_key_here