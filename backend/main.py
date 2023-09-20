from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import openai
import json
import os
import io
import requests
from dotenv import load_dotenv
from pdfminer.high_level import extract_text

load_dotenv()

# Init FastAPI app
app = FastAPI()

# CORS for frontend on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter setup
openai.api_key = os.getenv("OPENROUTER_API_KEY")
openai.api_base = "https://openrouter.ai/api/v1"

@app.get("/")
def root():
    return {"message": "Server running!"}

# ========== INTERVIEW START ==========
@app.post("/start-interview/")
async def start_interview(role: str = Form(...), resumeFile: UploadFile = Form(...)):
    contents = await resumeFile.read()

    try:
        resume_text = extract_text(io.BytesIO(contents))
    except Exception:
        resume_text = "[Resume parsing failed]"

    system_prompt = f"""
    You are a senior technical interviewer for the role of {role}.
    Start with a soft question like: 'Tell me about yourself' or 'Walk me through your resume.'
    Resume:
    {resume_text}
    """

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": [{"role": "system", "content": system_prompt}],
        }
    )

    reply = response.json()["choices"][0]["message"]["content"]
    return {
        "question": reply,
        "history": [{"role": "assistant", "content": reply}]
    }
# ========== INTERVIEW RESPONSE ==========
@app.post("/interview/")
async def interview(
    audio: UploadFile = File(...),
    role: str = Form(...),
    resume: str = Form(...),
    history: str = Form(...)
):
    try:
        history_data = json.loads(history)

        system_prompt = f"""
        You are a senior technical interviewer for the role: {role}.
        The candidate submitted an audio response. Based on the resume and chat so far,
        provide detailed, genuine feedback and follow-up question.
        Resume:
        {resume}
        """

        messages = [{"role": "system", "content": system_prompt}] + history_data
        messages.append({
            "role": "user",
            "content": "[User submitted a voice answer. Please give feedback.]"
        })

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": messages
            }
        )

        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        messages.append({"role": "assistant", "content": reply})

        return {"reply": reply, "history": messages}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})