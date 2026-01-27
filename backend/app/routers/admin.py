from fastapi import APIRouter

from app.repo import fetch_all_user_likes, fetch_films
from app.service import recs

router = APIRouter()


@router.post("/rebuild")
async def rebuild() -> dict[str, int]:
    films = await fetch_films()
    likes = await fetch_all_user_likes()
    recs.rebuild(films=films, user_likes=likes)
    return {"films": len(films), "users_with_likes": len(likes)}
