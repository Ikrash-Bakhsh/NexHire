from fastapi import APIRouter, HTTPException
from database import get_connection
from models import EmailRequest
from ai.engine import generate_cold_email

router = APIRouter(prefix="/api", tags=["Email & HR"])


@router.post("/email/generate")
async def generate_email(req: EmailRequest):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (req.user_id,))
            user = cur.fetchone()
            cur.execute("SELECT * FROM jobs WHERE id = %s", (req.job_id,))
            job = cur.fetchone()
        conn.close()
        if not user or not job:
            raise HTTPException(404, "User or job not found")
        email_text = await generate_cold_email(
            user["name"], job["title"], job["company"], user["cv_text"]
        )
        return {"email": email_text, "job": job["title"], "company": job["company"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/hr/find")
async def find_hr_email(company: str, job_title: str = ""):
    try:
        domain = company.lower().strip().replace(" ", "").replace(",", "").replace(".", "") + ".com"
        ce = company.replace(" ", "%20")
        je = job_title.replace(" ", "%20")

        return {
            "company": company,
            "job_title": job_title,
            "guessed_emails": [
                f"hr@{domain}",
                f"careers@{domain}",
                f"recruitment@{domain}",
                f"talent@{domain}",
                f"hiring@{domain}",
            ],
            "search_links": [
                {
                    "label": "🔗 LinkedIn — HR Recruiter",
                    "url": f"https://www.linkedin.com/search/results/people/?keywords={ce}%20recruiter%20{je}",
                    "description": "Company ke HR/Recruiter dhundho"
                },
                {
                    "label": "🔗 LinkedIn — Hiring Manager",
                    "url": f"https://www.linkedin.com/search/results/people/?keywords={ce}%20hiring%20manager%20{je}",
                    "description": "Job-specific hiring manager dhundho"
                },
                {
                    "label": "🔍 Google — HR Email",
                    "url": f"https://www.google.com/search?q={ce}+HR+recruiter+email+{je}",
                    "description": "Google se HR email dhundho"
                },
                {
                    "label": "🔍 Google — Careers Page",
                    "url": f"https://www.google.com/search?q={ce}+careers+contact+email",
                    "description": "Company careers page dhundho"
                },
            ],
            "apollo_link": f"https://app.apollo.io/#/people?organizationNames[]={ce}&personTitles[]=HR&personTitles[]=Recruiter",
            "note": "Guessed emails verify karo. LinkedIn links se actual HR ka naam aur email milega."
        }
    except Exception as e:
        return {"company": company, "guessed_emails": [], "search_links": [], "apollo_link": "", "note": str(e)}
