import React, { useState } from "react";
import axios from "axios";
import MicRecorder from "mic-recorder-to-mp3";

const recorder = new MicRecorder({ bitRate: 128 });

function App() {
  const [role, setRole] = useState("Frontend Engineer");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(uploaded);

    if (uploaded.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => setResumeText(event.target.result);
      reader.readAsText(uploaded);
    } else {
      setResumeText("📎 PDF uploaded");
    }
  };

  const handleStart = async () => {
    if (!file) return alert("Please upload your resume first!");

    const formData = new FormData();
    formData.append("role", role);
    formData.append("resumeFile", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/start-interview/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setChatHistory(res.data.history);
      setQuestion(res.data.question);
      setFeedback("");
      setStarted(true);
    } catch (err) {
      console.error("Start interview failed:", err.response?.data || err.message);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return alert("Please record your answer first.");

    const formData = new FormData();
    const file = new File([audioBlob], "answer.mp3", { type: "audio/mpeg" });
    formData.append("audio", file);
    formData.append("role", role);
    formData.append("resume", resumeText);
    formData.append("history", JSON.stringify(chatHistory));

    try {
      const res = await axios.post("http://127.0.0.1:8000/interview/", formData);
      const messages = res.data.history;
      const lastReply = res.data.reply;

      const [feedbackPart, ...rest] = lastReply.split(/(?=Question|Q\d|Next question|Follow-up)/i);
      const nextQuestion = rest.join(" ").trim();

      setFeedback(feedbackPart.trim());
      setQuestion(nextQuestion || "✅ Interview complete.");
      setChatHistory(messages);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error("Error sending answer:", err.response?.data || err.message);
    }
  };

  const startRecording = async () => {
    try {
      await recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Recording failed:", error);
    }
  };

  const stopRecording = async () => {
    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setRecording(false);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h2>🧠 AI Interview Simulator</h2>

      <label>
        Select Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Frontend Engineer</option>
          <option>Backend Developer</option>
          <option>Cloud Architect</option>
          <option>Data Analyst</option>
        </select>
      </label>

      <br /><br />
      <label>
        Upload Resume (PDF or TXT):
        <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} />
      </label>

      <br /><br />
      <button onClick={handleStart} disabled={!file}>
        Start Interview
      </button>

      <br /><br />
      {started && (
        <>
          <h4>🧑‍💼 Interviewer:</h4>
          <p>{question}</p>

          <div style={{ marginBottom: "1rem" }}>
            <button onClick={recording ? stopRecording : startRecording}>
              {recording ? "🛑 Stop Recording" : "🎤 Start Recording"}
            </button>
            {audioUrl && (
              <audio controls src={audioUrl} style={{ display: "block", marginTop: "0.5rem" }} />
            )}
          </div>

          <button onClick={handleSend} disabled={!audioBlob}>
            Send Audio Answer
          </button>

          {feedback && (
            <>
              <br />
              <h4>📝 Interviewer Feedback:</h4>
              <pre style={{ background: "#f4f4f4", padding: "1rem" }}>{feedback}</pre>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
