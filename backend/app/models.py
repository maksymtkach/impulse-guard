import time
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    api_token: str = Field(unique=True)
    created_at: float = Field(default_factory=lambda: time.time())

class Event(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    score: int
    emotions_json: str = Field(default="{}")
    risks_json: str = Field(default="{}")
    created_at: float = Field(default_factory=lambda: time.time())
