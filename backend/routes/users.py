from fastapi import APIRouter, HTTPException
from database import get_connection
from models import UserProfile

router = APIRouter(prefix="/api/user", tags=["Users"])


@router.post("/save")
async def save_user(profile: UserProfile):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (profile.email,))
            existing = cur.fetchone()
            if existing:
                cur.execute("""
                    UPDATE users SET name=%s, phone=%s, cv_text=%s,
                    skills=%s, preferred_roles=%s, preferred_location=%s
                    WHERE email=%s
                """, (profile.name, profile.phone, profile.cv_text,
                      profile.skills, profile.preferred_roles,
                      profile.preferred_location, profile.email))
                user_id = existing["id"]
            else:
                cur.execute("""
                    INSERT INTO users (name, email, phone, cv_text, skills,
                    preferred_roles, preferred_location)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (profile.name, profile.email, profile.phone,
                      profile.cv_text, profile.skills,
                      profile.preferred_roles, profile.preferred_location))
                user_id = cur.lastrowid
        conn.commit()
        conn.close()
        return {"success": True, "user_id": user_id}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{user_id}")
async def get_user(user_id: int):
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
        conn.close()
        if not user:
            raise HTTPException(404, "User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
