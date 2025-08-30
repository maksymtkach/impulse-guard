from sqlmodel import SQLModel, create_engine, Session
from .config import DB_URL

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

def init_db() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
