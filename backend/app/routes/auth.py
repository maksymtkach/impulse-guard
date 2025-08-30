from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from ..db import get_session
from ..models import User
from ..schemas import RegisterIn, LoginIn, LoginOut
from ..auth import hash_password, verify_password, new_api_token

router = APIRouter()

@router.post("/register")
def register(inp: RegisterIn, session: Session = Depends(get_session)):
    exists = session.exec(select(User).where(User.email == inp.email)).first()
    if exists:
        raise HTTPException(status_code=400, detail="User exists")
    user = User(email=inp.email, password_hash=hash_password(inp.password), api_token=new_api_token())
    session.add(user)
    session.commit()
    return {"ok": True}

@router.post("/login", response_model=LoginOut)
def login(inp: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == inp.email)).first()
    if not user or not verify_password(inp.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"apiToken": user.api_token}
    