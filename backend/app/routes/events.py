import json
from fastapi import APIRouter, Depends, Header
from sqlmodel import Session, select
from typing import Optional, Dict
from ..db import get_session
from ..models import Event, User
from ..schemas import EventIn, SummaryOut
from ..auth import parse_bearer, get_user_by_token

router = APIRouter()

@router.post("/event")
def save_event(
    e: EventIn,
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_session),
):
    token = parse_bearer(authorization)
    user: User = get_user_by_token(session, token)
    session.add(Event(
        user_id=user.id, score=e.score,
        emotions_json=json.dumps(e.emotions),
        risks_json=json.dumps(e.risks),
    ))
    session.commit()
    return {"ok": True}

@router.get("/summary", response_model=SummaryOut)
def summary(
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_session),
):
    token = parse_bearer(authorization)
    user: User = get_user_by_token(session, token)
    rows = session.exec(select(Event).where(Event.user_id == user.id)).all()
    if not rows:
        return {"avgScore": 0.0, "events": 0, "topEmotions": {}}
    avg = sum(r.score for r in rows) / len(rows)
    agg: Dict[str, int] = {}
    for r in rows:
        emo = json.loads(r.emotions_json or "{}")
        for k, v in emo.items():
            agg[k] = agg.get(k, 0) + int(v)
    return {"avgScore": round(avg, 1), "events": len(rows), "topEmotions": agg}
