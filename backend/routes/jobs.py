from fastapi import APIRouter, HTTPException
from database import get_connection
from models import JobSearchRequest
from scraper.linkedin import scrape_linkedin_jobs, scrape_indeed_jobs, scrape_job_description

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/search")
async def search_jobs(req: JobSearchRequest):
    try:
        jobs = (scrape_indeed_jobs if req.source == "indeed" else scrape_linkedin_jobs)(
            req.keyword, req.location, req.limit
        )
        if not jobs:
            return {"jobs": [], "message": "No jobs found. Try different keywords."}

        conn = get_connection()
        saved_jobs = []
        with conn.cursor() as cur:
            for job in jobs:
                cur.execute("""
                    INSERT INTO jobs (title, company, location, description, url, source, posted_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (job["title"], job["company"], job["location"],
                      job["description"], job["url"], job["source"], job["posted_date"]))
                job["id"] = cur.lastrowid
                saved_jobs.append(job)
        conn.commit()
        conn.close()
        return {"jobs": saved_jobs, "total": len(saved_jobs)}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("")
async def get_all_jobs():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM jobs ORDER BY scraped_at DESC LIMIT 100")
            jobs = cur.fetchall()
        conn.close()
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{job_id}/description")
async def get_job_description(job_id: int):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
            job = cur.fetchone()
        conn.close()
        if not job:
            raise HTTPException(404, "Job not found")
        if not job["description"] and job["url"]:
            desc = scrape_job_description(job["url"])
            if desc:
                conn = get_connection()
                with conn.cursor() as cur:
                    cur.execute("UPDATE jobs SET description=%s WHERE id=%s", (desc, job_id))
                conn.commit()
                conn.close()
                job["description"] = desc
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
