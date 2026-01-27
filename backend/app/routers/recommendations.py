from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.repo import fetch_user_liked_film_ids, find_film_id_by_tmdb_id
from app.service import recs

router = APIRouter()


@router.get("/user/{user_id}")
async def recommend_for_user(
    user_id: str,
    algorithm: str = Query(default="hybrid", pattern="^(content|collab|collab-item|collab-user|hybrid)$"),
    k: int = Query(default=settings.recs_default_k, ge=1, le=100),
):
    liked = await fetch_user_liked_film_ids(user_id)
    if not liked:
        raise HTTPException(status_code=404, detail="User has no likes yet")
    return recs.recommend_for_user(user_id=user_id, liked_film_ids=liked, algorithm=algorithm, k=k)


@router.get("/similar/{film_id}")
async def similar_films(
    film_id: str,
    algorithm: str = Query(default="content", pattern="^(content|collab|collab-item|collab-user|hybrid)$"),
    k: int = Query(default=settings.recs_default_k, ge=1, le=100),
):
    # Try to interpret film_id as tmdbId (integer) first
    db_film_id = film_id
    try:
        tmdb_id = int(film_id)
        found_id = await find_film_id_by_tmdb_id(tmdb_id)
        if found_id:
            db_film_id = found_id
    except ValueError:
        # Not a number, assume it's already a DB id
        pass
    
    return recs.similar_films(film_id=db_film_id, algorithm=algorithm, k=k)
