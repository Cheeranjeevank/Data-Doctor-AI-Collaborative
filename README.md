# 🩺 DataDoctor Collaborative

> **"AI that diagnoses your data — and knows when to ask a human."**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini-3.6%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Team ALT_CODE** — Hackathon 2026

DataDoctor Collaborative is an AI-powered data quality and reliability platform. Upload any dataset, and DataDoctor automatically profiles every column, runs three statistical anomaly detection algorithms, and lets you chat with a custom Gemini AI agent that reads your actual data to answer any natural-language question.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Intelligent Profiling** | Auto-computes per-column stats (missing %, mean, std, min/max) via Pandas |
| 🚨 **Anomaly Detection** | Z-Score, IQR Fence, and Missing Value Spike — three algorithms run in parallel |
| 🧠 **DataDoctor AI** | Custom Gemini 3.6 Flash agent with dataset context injection answers natural-language questions |
| 🤝 **Human-AI Collaboration** | When AI confidence is low, it escalates to a human via live chat |
| ⏱️ **Time Travel Simulator** | Inject a live pipeline failure and watch the dashboard react in real time |
| 🕸️ **Pipeline Knowledge Graph** | Interactive React Flow diagram shows the blast radius of any anomaly |
| 💰 **Financial Impact Estimator** | Translates data issues into estimated business revenue impact |

---

## 🏗️ Architecture

```
┌─────────────┐     REST API      ┌──────────────────────────────────────┐
│  React      │ ◄───────────────► │  FastAPI Backend                     │
│  Frontend   │                   │                                      │
│  (Vite +    │                   │  ┌─────────────┐  ┌───────────────┐ │
│  Tailwind)  │                   │  │  Profiling  │  │   Anomaly     │ │
└─────────────┘                   │  │  Engine     │  │   Detector    │ │
                                  │  │  (Pandas)   │  │  (Z-Score,   │ │
                                  │  └─────────────┘  │   IQR, MV)   │ │
                                  │                   └───────────────┘ │
                                  │  ┌────────────────────────────────┐ │
                                  │  │  DataDoctor AI (Gemini 3.6)    │ │
                                  │  │  Custom persona + context      │ │
                                  │  └────────────────────────────────┘ │
                                  │  SQLite / SQLAlchemy ORM            │
                                  └──────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/Cheeranjeevank/Data-Doctor-AI-Collaborative.git
cd Data-Doctor-AI-Collaborative
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example and add your Gemini API key
cp ../.env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧪 How to Use

1. **Upload a Dataset** → Go to `/datasets` → click "Upload Dataset" → select any CSV, JSON, or XLSX file
2. **View Anomalies** → Navigate to `/anomalies` — real anomalies are detected automatically after upload
3. **Chat with AI** → Go to `/collaborate` → select your dataset → ask anything in natural language
4. **Live Demo** → On the Dashboard, click **"Inject Pipeline Failure"** to see the simulator in action

---

## 🛠️ Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy + SQLite
- Pandas, NumPy, Scikit-learn
- Google GenAI SDK (Gemini 3.6 Flash)
- Python-dotenv

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Flow (@xyflow/react)
- Recharts

---

## 📁 Project Structure

```
DataDoctor/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── database/      # SQLAlchemy models & config
│   │   ├── engines/
│   │   │   ├── profiling/ # Pandas profiling engine
│   │   │   ├── anomaly/   # Z-Score, IQR, Missing Value detection
│   │   │   └── ai/        # Gemini AI agent
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Dashboard, Datasets, Anomalies, Collaborate
│   │   ├── components/    # Sidebar, PipelineGraph, DemoSimulator
│   │   └── App.tsx
│   └── package.json
├── .env.example
├── docker-compose.yml
└── DataDoctor_ALT_CODE_Hackathon.pptx
```

---

## 🔑 Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./datadoctor.db
UPLOAD_DIR=./data/raw
```

> ⚠️ Never commit `.env` — it is listed in `.gitignore`

---

## 👥 Team

**Team ALT_CODE** 

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
