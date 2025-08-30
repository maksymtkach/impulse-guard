import secrets
from typing import Optional
from fastapi import HTTPException
import bcrypt
from sqlmodel import select, Session
from .models import User

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def get_user_by_token(session: Session, token: str) -> User:
    user = session.exec(select(User).where(User.api_token == token)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Bad token")
    return user

def new_api_token() -> str:
    return secrets.token_hex(16)

def parse_bearer(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token")
    return authorization.split(" ", 1)[1]
