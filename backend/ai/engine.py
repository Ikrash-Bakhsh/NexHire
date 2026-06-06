import httpx
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")


# ── Core Ollama Call ──────────────────────────────────────────────────────────

async def call_ollama(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.7, "num_predict": 2048}
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            resp = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            resp.raise_for_status()
            return resp.json()["message"]["content"]
        except httpx.ConnectError:
            raise Exception("Ollama nahi chal raha. 'ollama serve' run karo.")
        except Exception as e:
            raise Exception(f"Ollama error: {str(e)}")


def parse_json(raw: str) -> dict:
    """Extract and parse JSON from Ollama response."""
    raw = raw.strip()
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group(0)
    try:
        return json.loads(raw)
    except Exception:
        return {}


# ── CV Tailoring ──────────────────────────────────────────────────────────────

async def tailor_cv(cv_text: str, job_title: str, company: str, job_description: str) -> dict:
    system = """You are NexHire AI, an expert CV writer and career coach.
Always respond with valid JSON only. No markdown, no extra text."""

    prompt = f"""Tailor this CV for the job and return JSON:

{{
  "match_score": <integer 0-100>,
  "match_summary": "<2 sentence summary>",
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "tailored_cv": "<rewritten CV tailored for this role>",
  "cover_letter": "<professional cover letter>",
  "key_improvements": ["improvement1", "improvement2"]
}}

JOB TITLE: {job_title}
COMPANY: {company}

JOB DESCRIPTION:
{job_description[:2000]}

CANDIDATE CV:
{cv_text[:2000]}

Return ONLY the JSON object."""

    raw = await call_ollama(prompt, system)
    result = parse_json(raw)

    if not result:
        return {
            "match_score": 0,
            "match_summary": "Could not parse response.",
            "matching_skills": [],
            "missing_skills": [],
            "tailored_cv": cv_text,
            "cover_letter": "",
            "key_improvements": []
        }
    return result


# ── Cold Email ────────────────────────────────────────────────────────────────

async def generate_cold_email(candidate_name: str, job_title: str, company: str, cv_text: str) -> str:
    system = "You are an expert at writing professional cold emails for job applications."

    prompt = f"""Write a short professional cold email from {candidate_name}
to the HR of {company} for the position of {job_title}.

Candidate background:
{cv_text[:1000]}

Rules:
- Maximum 150 words
- Professional but personable tone
- Mention specific interest in {company}
- End with a call to action
- Do not use placeholder text

Return only the email text, no subject line."""

    return await call_ollama(prompt, system)


# ── Interview Tips ────────────────────────────────────────────────────────────

async def generate_interview_tips(job_title: str, company: str, job_description: str, cv_text: str) -> dict:
    system = "You are an expert interview coach. Return only valid JSON."

    prompt = f"""Generate interview prep for {job_title} at {company}.

Return JSON:
{{
  "tips": ["tip1", "tip2", "tip3"],
  "likely_questions": ["q1", "q2", "q3", "q4", "q5"],
  "suggested_answers": {{
    "q1": "answer1",
    "q2": "answer2"
  }}
}}

Job Description: {job_description[:1000]}
CV: {cv_text[:1000]}"""

    raw = await call_ollama(prompt, system)
    result = parse_json(raw)
    return result if result else {"tips": [], "likely_questions": [], "suggested_answers": {}}
