from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import db
from .repo import fetch_all_user_likes, fetch_films
from .routers import admin, health, recommendations
from .service import recs

app = FastAPI(title="Recommendation Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    await db.connect()
    films = await fetch_films()
    likes = await fetch_all_user_likes()
    recs.rebuild(films=films, user_likes=likes)


@app.on_event("shutdown")
async def _shutdown() -> None:
    await db.close()

# Routers
app.include_router(health.router, tags=["health"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])

