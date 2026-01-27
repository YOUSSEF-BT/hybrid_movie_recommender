from __future__ import annotations

from typing import Any

from .db import db
from .recommenders import FilmRow


async def fetch_films(limit: int | None = None) -> list[FilmRow]:
    """
    Fetch films with normalized genres from FilmGenre join table.
    Includes all new fields: backdropUrl, overview, rating, trailerUrl, tmdbId.
    """
    q = """
    SELECT 
        f.id, 
        f.title, 
        f.director, 
        f.genre, 
        f."imageUrl",
        f."backdropUrl",
        f.overview,
        f.rating,
        f."trailerUrl",
        f.year,
        f."tmdbId",
        COALESCE(
            ARRAY_AGG(DISTINCT g.name ORDER BY g.name) FILTER (WHERE g.name IS NOT NULL),
            ARRAY[]::text[]
        ) AS genres
    FROM public.films f
    LEFT JOIN public.film_genres fg ON f.id = fg."filmId"
    LEFT JOIN public.genres g ON fg."genreId" = g.id
    GROUP BY f.id, f.title, f.director, f.genre, f."imageUrl", f."backdropUrl", 
             f.overview, f.rating, f."trailerUrl", f.year, f."tmdbId"
    ORDER BY f."createdAt" DESC
    """
    if limit is not None:
        q += " LIMIT $1"
        rows = await db.pool.fetch(q, limit)
    else:
        rows = await db.pool.fetch(q)
    return [
        FilmRow(
            id=str(r["id"]),
            title=r["title"],
            director=r["director"],
            genre=r["genre"],
            genres=r["genres"] or [],
            imageUrl=r["imageUrl"],
            backdropUrl=r["backdropUrl"],
            overview=r["overview"],
            rating=float(r["rating"]) if r["rating"] is not None else None,
            trailerUrl=r["trailerUrl"],
            year=r["year"],
            tmdbId=r["tmdbId"],
        )
        for r in rows
    ]


async def fetch_user_liked_film_ids(user_id: str) -> list[str]:
    q = """
    SELECT "filmId"
    FROM public.user_film_likes
    WHERE "userId" = $1
    """
    rows = await db.pool.fetch(q, user_id)
    raw_ids = [str(r["filmId"]) for r in rows]
    # Normalize: if likes were stored as TMDB ids (numeric strings), map them to our DB film ids
    out: list[str] = []
    for fid in raw_ids:
        if fid.isdigit():
            mapped = await find_film_id_by_tmdb_id(int(fid))
            out.append(mapped or fid)
        else:
            out.append(fid)
    return out


async def fetch_all_user_likes() -> dict[str, set[str]]:
    q = """
    SELECT "userId", "filmId"
    FROM public.user_film_likes
    """
    rows = await db.pool.fetch(q)
    out: dict[str, set[str]] = {}
    for r in rows:
        uid = str(r["userId"])
        fid = str(r["filmId"])
        # Normalize TMDB-id likes (numeric strings) to DB film ids for consistent similarity + exclusion
        if fid.isdigit():
            mapped = await find_film_id_by_tmdb_id(int(fid))
            fid = mapped or fid
        out.setdefault(uid, set()).add(fid)
    return out


async def find_film_id_by_tmdb_id(tmdb_id: int) -> str | None:
    """Find a film's DB id by its tmdbId."""
    q = """
    SELECT id
    FROM public.films
    WHERE "tmdbId" = $1
    LIMIT 1
    """
    row = await db.pool.fetchrow(q, tmdb_id)
    return str(row["id"]) if row else None


def filmrow_to_public(f: FilmRow) -> dict[str, Any]:
    """Convert FilmRow to public Film model dict."""
    return {
        "id": f.id,
        "title": f.title,
        "director": f.director,
        "genre": f.genre,
        "genres": f.genres if f.genres else None,
        "imageUrl": f.imageUrl,
        "backdropUrl": f.backdropUrl,
        "overview": f.overview,
        "rating": f.rating,
        "trailerUrl": f.trailerUrl,
        "year": f.year,
        "tmdbId": f.tmdbId,
    }

