import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

DB_URL = os.getenv("DB_URL", "sqlite:///./impulse.db")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
CORS_ORIGINS = [
    FRONTEND_ORIGIN,
    "http://127.0.0.1:5173",
    "chrome-extension://*",
    "*",
]

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
