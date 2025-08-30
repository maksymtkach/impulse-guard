from typing import Optional, Dict
from pydantic import BaseModel

class RegisterIn(BaseModel):
    email: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

class LoginOut(BaseModel):
    apiToken: str

class EventIn(BaseModel):
    score: int
    emotions: Dict[str, int] = {}
    risks: Dict[str, int] = {}

class SummaryOut(BaseModel):
    avgScore: float
    events: int
    topEmotions: Dict[str, int]

class RewriteIn(BaseModel):
    text: str
