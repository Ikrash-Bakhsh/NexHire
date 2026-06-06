from fastapi import APIRouter, HTTPException
from database import get_connection
from models import TailorRequest, ApplicationStatusUpdate
from ai.engine import tailor_cv, generate_interview_tips

router = APIRouter(prefix="/api", tags=["Applications"])


@router.post("/tailor")
async def tailor_application(req: TailorRequest):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (req.user_id,))
            user = cur.fetchone()
            cur.execute("SELECT * FROM jobs WHERE id = %s", (req.job_id,))
            job = cur.fetchone()
        conn.close()

        if not user:
            raise HTTPException(404, "User not found")
        if not job:
            raise HTTPException(404, "Job not found")

        result = await tailor_cv(
            user["cv_text"], job["title"], job["company"],
            job["description"] or f"{job['title']} at {job['company']}"
        )

        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO applications
                (user_id, job_id, status, tailored_cv, cover_letter, match_score)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (req.user_id, req.job_id, "tailored",
                  result.get("tailored_cv", ""),
                  result.get("cover_letter", ""),
                  result.get("match_score", 0)))
            app_id = cur.lastrowid
        conn.commit()
        conn.close()

        result["application_id"] = app_id
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/applications/{user_id}")
async def get_applications(user_id: int):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.*, j.title, j.company, j.location, j.url
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.user_id = %s
                ORDER BY a.applied_at DESC
            """, (user_id,))
            apps = cur.fetchall()
        conn.close()
        return {"applications": apps}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.put("/applications/status")
async def update_status(req: ApplicationStatusUpdate):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE applications SET status=%s WHERE id=%s",
                (req.status, req.application_id)
            )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/interview/{application_id}")
async def get_interview_tips(application_id: int):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.*, j.title, j.company, j.description, u.cv_text
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN users u ON a.user_id = u.id
                WHERE a.id = %s
            """, (application_id,))
            data = cur.fetchone()
        conn.close()
        if not data:
            raise HTTPException(404, "Application not found")
        return await generate_interview_tips(
            data["title"], data["company"],
            data["description"] or "", data["cv_text"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
