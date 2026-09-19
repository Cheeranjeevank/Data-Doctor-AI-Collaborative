from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()

from .database.config import engine, Base
from .api import datasets, anomalies, ai

# Auto-create tables for prototyping
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DataDoctor Collaborative API",
    description="AI that diagnoses your data — and knows when to ask a human.",
    version="2.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(anomalies.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DataDoctor Collaborative API v2.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "ai_engine": "gemini-1.5-flash", "version": "2.0.0"}
