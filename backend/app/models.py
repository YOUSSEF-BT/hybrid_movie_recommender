from __future__ import annotations

from pydantic import BaseModel


class Film(BaseModel):
    id: str
    title: str
    director: str | None = None
    genre: str | None = None  # Primary genre (for backward compat)
    genres: list[str] | None = None  # All genres from normalized table
    imageUrl: str | None = None
    backdropUrl: str | None = None
    overview: str | None = None
    rating: float | None = None
    trailerUrl: str | None = None
    year: int | None = None
    tmdbId: int | None = None


class RecommendationItem(BaseModel):
    film: Film
    score: float
    reason: str | None = None


class RecommendationsResponse(BaseModel):
    userId: str | None = None
    seedFilmId: str | None = None
    algorithm: str
    items: list[RecommendationItem]

