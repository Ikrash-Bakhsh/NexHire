from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    cv_text: str
    skills: str
    preferred_roles: str
    preferred_location: Optional[str] = ""


class JobSearchRequest(BaseModel):
    keyword: str
    location: Optional[str] = ""
    limit: Optional[int] = 20
    source: Optional[str] = "linkedin"


class TailorRequest(BaseModel):
    user_id: int
    job_id: int


class EmailRequest(BaseModel):
    user_id: int
    job_id: int


class ApplicationStatusUpdate(BaseModel):
    application_id: int
    status: str
