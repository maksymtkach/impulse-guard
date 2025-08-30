from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .db import init_db
from .routes import auth as auth_routes
from .routes import events as events_routes
from .routes import rewrite as rewrite_routes
from .routes import health as health_routes

app = FastAPI(title="ImpulseGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

app.include_router(auth_routes.router)
app.include_router(events_routes.router)
app.include_router(rewrite_routes.router)
app.include_router(health_routes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
