import json
from fastapi import APIRouter, Depends, Header
from sqlmodel import Session, select
from typing import Optional, Dict
from ..db import get_session
from ..models import Event, User
from ..schemas import EventIn, SummaryOut
from ..auth import parse_bearer, get_user_by_token
from pydantic import BaseModel
import time
from fastapi import HTTPException
from ..db import engine
import random



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
        user_id=user.id,
        score=e.score,
        emotions_json=json.dumps(e.emotions or {}),
        risks_json=json.dumps(e.risks or {}),
        created_at=time.time()  # 🔑 додаємо timestamp
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

# --- NEW: rich summary for charts ---
from datetime import datetime, timedelta
from typing import List

class TimelineEventOut(BaseModel):
    id: str
    timestamp: int  # UNIX ms
    sentiscore: int
    emotions: Dict[str,int]
    risks: List[str]
    description: str

class TrendPoint(BaseModel):
    date: Optional[str] = None
    week: Optional[str] = None
    month: Optional[str] = None
    score: float

class EnhancedSummaryOut(BaseModel):
    avgScore: float
    events: int
    topEmotions: Dict[str,int]
    timeline: List[TimelineEventOut]
    risks: List[Dict[str,object]]
    trends: Dict[str, List[TrendPoint]]

def _ts_ms(ts: float) -> int:
    return int(ts * 1000)

@router.get("/summary/full", response_model=EnhancedSummaryOut)
def summary_full(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No token")
    token = authorization.split(" ", 1)[1]

    with Session(engine) as s:
        user = get_user_by_token(s, token)

        rows = s.exec(
            select(Event)
            .where(Event.user_id == user.id)
            .order_by(Event.created_at.asc())
        ).all()

    if not rows:
        return {
            "avgScore": 0.0, "events": 0, "topEmotions": {},
            "timeline": [], "risks": [],
            "trends": {"daily":[], "weekly":[], "monthly":[]}
        }

    # avg & emotions
    avg = sum(r.score for r in rows) / len(rows)
    emo_aggr: Dict[str,int] = {}
    for r in rows:
        emo = json.loads(r.emotions_json or "{}")
        for k,v in emo.items():
            emo_aggr[k] = emo_aggr.get(k,0) + int(v)

    # timeline (останні 20 подій)
    tl: List[TimelineEventOut] = []
    for r in rows[-20:]:
        risks_map = json.loads(r.risks_json or "{}")
        top_labels = sorted([k for k,c in risks_map.items() if c>0], key=lambda k: -risks_map[k])[:3]
        desc = "Rewritten" if r.score < 50 else "Sent"
        tl.append(TimelineEventOut(
            id=str(r.id),
            timestamp=_ts_ms(r.created_at),  # <-- тут
            sentiscore=int(r.score),
            emotions=json.loads(r.emotions_json or "{}"),
            risks=top_labels,
            description=desc
        ))


    # risks summary
    risks_total: Dict[str,int] = {}
    for r in rows:
        m = json.loads(r.risks_json or "{}")
        for k,c in m.items():
            risks_total[k] = risks_total.get(k,0) + int(c)
    def level(cnt:int)->str:
        return "critical" if cnt>=8 else "super-risky" if cnt>=4 else "warning"
    risks_list = [
        {"category":k, "level":level(c), "count":c,
         "description": f"Detected {c} time(s) in the last period."}
        for k,c in sorted(risks_total.items(), key=lambda kv: -kv[1])
    ]

    # trends: daily(14), weekly(6), monthly(6)
    def avg_by(key_func, label_func, limit):
        buckets: Dict[str, List[int]] = {}
        for r in rows:
            key = label_func(datetime.fromtimestamp(r.created_at))
            buckets.setdefault(key, []).append(r.score)
        pts = [{"label":k, "score": round(sum(v)/len(v),1)} for k,v in buckets.items()]
        pts.sort(key=lambda x: x["label"])
        return pts[-limit:]

    daily_pts = avg_by(
        lambda dt: dt.date(),
        lambda dt: dt.strftime("%Y-%m-%d"),
        14
    )
    weekly_pts = avg_by(
        lambda dt: (dt.isocalendar().year, dt.isocalendar().week),
        lambda dt: f"{dt.isocalendar().year}-W{dt.isocalendar().week:02d}",
        6
    )
    monthly_pts = avg_by(
        lambda dt: (dt.year, dt.month),
        lambda dt: dt.strftime("%Y-%m"),
        6
    )

    return {
        "avgScore": round(avg,1),
        "events": len(rows),
        "topEmotions": emo_aggr,
        "timeline": tl,
        "risks": risks_list,
        "trends": {
            "daily":  [{"date":p["label"], "score":p["score"]} for p in daily_pts],
            "weekly": [{"week":p["label"], "score":p["score"]} for p in weekly_pts],
            "monthly":[{"month":p["label"],"score":p["score"]} for p in monthly_pts],
        }
    }

@router.post("/seed-demo")
def seed_demo(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No token")
    token = authorization.split(" ", 1)[1]

    now = time.time()
    demo = []
    for days_ago in range(7):
        for _ in range(random.randint(3, 8)):  # кілька подій на день
            t = now - 60*60*24*days_ago - random.randint(0, 3600)
            score = random.randint(20, 90)
            emo = {
                "anger": random.randint(0, 100),
                "urgency": random.randint(0, 100),
                "frustration": random.randint(0, 50),
            }
            risks = {
                "absolutism": random.randint(0, 2),
                "you-attack": random.randint(0, 1),
                "sarcasm": random.randint(0, 1),
            }
            demo.append({"t": t, "score": score, "emo": emo, "risks": risks})

    with Session(engine) as s:
        user = get_user_by_token(s, token)

        for d in demo:
            s.add(Event(
                user_id=user.id,
                score=int(d["score"]),
                emotions_json=json.dumps(d["emo"]),
                risks_json=json.dumps(d["risks"]),
                created_at=d["t"]
            ))
        s.commit()
    return {"ok": True, "seeded": len(demo)}
