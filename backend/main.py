"""
NexHire - AI Job Application System
Backend Entry Point
"""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import test_connection
from routes.users import router as users_router
from routes.jobs import router as jobs_router
from routes.applications import router as applications_router
from routes.email import router as email_router
from routes.cv import router as cv_router


# ── App Setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NexHire API",
    version="2.0.0",
    description="AI-Powered Job Application System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routes ───────────────────────────────────────────────────────────

app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(email_router)
app.include_router(cv_router)


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    db_ok = test_connection()
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            models = [m["name"] for m in resp.json().get("models", [])]
            ollama_ok = True
    except Exception:
        ollama_ok = False
        models = []
    return {
        "status": "ok",
        "database": db_ok,
        "ollama": ollama_ok,
        "models": models
    }


# ── Serve Frontend ────────────────────────────────────────────────────────────

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
