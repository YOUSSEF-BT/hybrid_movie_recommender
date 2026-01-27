from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass(frozen=True)
class FilmRow:
    id: str
    title: str
    director: str | None
    genre: str | None  # Primary genre
    genres: list[str]  # All genres (normalized)
    imageUrl: str | None
    backdropUrl: str | None
    overview: str | None
    rating: float | None
    trailerUrl: str | None
    year: int | None
    tmdbId: int | None


def _film_text(f: FilmRow) -> str:
    """Build text representation for TF-IDF using title, director, genres, overview, year."""
    parts = [f.title or ""]
    if f.director:
        parts.append(f.director)
    # Use normalized genres (better than single genre string)
    if f.genres:
        parts.extend(f.genres)
    elif f.genre:
        parts.append(f.genre)  # Fallback to single genre
    if f.overview:
        # Use first 200 chars of overview for better content matching
        parts.append(f.overview[:200])
    if f.year:
        parts.append(str(f.year))
    return " ".join(parts)


class ContentBasedRecommender:
    """
    TF-IDF over film metadata. Supports:
    - similar_items(film_id)
    - recommend_for_user(liked_film_ids): average similarity to liked items
    """

    def __init__(self, films: list[FilmRow]) -> None:
        self.films = films
        self.id_to_idx = {f.id: i for i, f in enumerate(films)}
        texts = [_film_text(f) for f in films]
        self.vectorizer = TfidfVectorizer(stop_words="english", min_df=1)
        self.matrix = self.vectorizer.fit_transform(texts)

    def similar_items(self, film_id: str, k: int) -> list[tuple[str, float]]:
        if film_id not in self.id_to_idx:
            return []
        idx = self.id_to_idx[film_id]
        sims = cosine_similarity(self.matrix[idx], self.matrix).ravel()
        sims[idx] = 0.0
        top = np.argsort(-sims)[:k]
        return [(self.films[i].id, float(sims[i])) for i in top if sims[i] > 0]

    def recommend_for_user(self, liked_film_ids: list[str], k: int) -> list[tuple[str, float]]:
        liked_idx = [self.id_to_idx[i] for i in liked_film_ids if i in self.id_to_idx]
        if not liked_idx:
            return []
        liked_mat = self.matrix[liked_idx]
        user_vec = liked_mat.mean(axis=0)
        user_vec = user_vec.A if hasattr(user_vec, "A") else user_vec
        sims = cosine_similarity(user_vec, self.matrix).ravel()
        for i in liked_idx:
            sims[i] = 0.0
        top = np.argsort(-sims)[:k]
        return [(self.films[i].id, float(sims[i])) for i in top if sims[i] > 0]


class CollaborativeItemItemRecommender:
    """
    Item-item similarity based on co-like counts:
    sim(i,j) = co_like(i,j) / sqrt(like_count(i) * like_count(j))
    """

    def __init__(self, user_likes: dict[str, set[str]]) -> None:
        self.user_likes = user_likes
        self.like_count: dict[str, int] = {}
        for _, items in user_likes.items():
            for it in items:
                self.like_count[it] = self.like_count.get(it, 0) + 1

        # co-like counts
        self.co: dict[tuple[str, str], int] = {}
        for _, items in user_likes.items():
            items_list = list(items)
            for a_i in range(len(items_list)):
                for b_i in range(a_i + 1, len(items_list)):
                    a = items_list[a_i]
                    b = items_list[b_i]
                    if a == b:
                        continue
                    key = (a, b) if a < b else (b, a)
                    self.co[key] = self.co.get(key, 0) + 1

    def _sim(self, a: str, b: str) -> float:
        if a == b:
            return 0.0
        key = (a, b) if a < b else (b, a)
        co = self.co.get(key, 0)
        if co == 0:
            return 0.0
        denom = (self.like_count.get(a, 0) * self.like_count.get(b, 0)) ** 0.5
        return float(co / denom) if denom else 0.0

    def similar_items(self, film_id: str, k: int) -> list[tuple[str, float]]:
        # brute force over known items (OK for small datasets like IMDB top 1000)
        scores: list[tuple[str, float]] = []
        for other in self.like_count.keys():
            if other == film_id:
                continue
            s = self._sim(film_id, other)
            if s > 0:
                scores.append((other, s))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:k]

    def recommend_for_user(self, liked_film_ids: list[str], k: int) -> list[tuple[str, float]]:
        liked = set(liked_film_ids)
        candidate_scores: dict[str, float] = {}
        for seed in liked:
            for other, s in self.similar_items(seed, k=200):
                if other in liked:
                    continue
                candidate_scores[other] = candidate_scores.get(other, 0.0) + s
        ranked = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:k]


class CollaborativeUserUserRecommender:
    """
    User-user similarity based on co-liked items:
    sim(u,v) = |items_u ∩ items_v| / sqrt(|items_u| * |items_v|)
    
    Recommendations: Find similar users, then recommend items they liked
    """

    def __init__(self, user_likes: dict[str, set[str]]) -> None:
        self.user_likes = user_likes
        # Build user-user similarity cache
        self.user_similarities: dict[tuple[str, str], float] = {}
        self._compute_user_similarities()

    def _compute_user_similarities(self) -> None:
        """Pre-compute user-user similarities using Jaccard-like similarity."""
        users = list(self.user_likes.keys())
        for i, u1 in enumerate(users):
            items1 = self.user_likes[u1]
            if not items1:
                continue
            for u2 in users[i + 1 :]:
                items2 = self.user_likes[u2]
                if not items2:
                    continue
                # Jaccard-like similarity: intersection / sqrt(product)
                intersection = len(items1 & items2)
                if intersection == 0:
                    continue
                similarity = intersection / ((len(items1) * len(items2)) ** 0.5)
                key = (u1, u2) if u1 < u2 else (u2, u1)
                self.user_similarities[key] = similarity

    def _user_similarity(self, u1: str, u2: str) -> float:
        """Get similarity between two users."""
        if u1 == u2:
            return 1.0
        key = (u1, u2) if u1 < u2 else (u2, u1)
        return self.user_similarities.get(key, 0.0)

    def similar_users(self, user_id: str, k: int) -> list[tuple[str, float]]:
        """Find k most similar users to the given user."""
        if user_id not in self.user_likes:
            return []
        scores: list[tuple[str, float]] = []
        for other_user in self.user_likes.keys():
            if other_user == user_id:
                continue
            sim = self._user_similarity(user_id, other_user)
            if sim > 0:
                scores.append((other_user, sim))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:k]

    def recommend_for_user(self, user_id: str, liked_film_ids: list[str], k: int) -> list[tuple[str, float]]:
        """
        Recommend items based on what similar users liked.
        Score = sum of (user_similarity * 1) for each similar user who liked the item.
        """
        if user_id not in self.user_likes:
            return []
        
        liked = set(liked_film_ids)
        # Find similar users
        similar_users = self.similar_users(user_id, k=50)  # Get top 50 similar users
        
        # Accumulate scores from similar users' liked items
        candidate_scores: dict[str, float] = {}
        for similar_user_id, similarity in similar_users:
            similar_user_likes = self.user_likes.get(similar_user_id, set())
            for item in similar_user_likes:
                if item in liked:
                    continue  # Skip items user already liked
                candidate_scores[item] = candidate_scores.get(item, 0.0) + similarity
        
        ranked = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:k]

    def similar_items(self, film_id: str, k: int) -> list[tuple[str, float]]:
        """
        For item similarity in user-user approach:
        Find users who liked this item, then find items liked by those users.
        """
        # Find users who liked this item
        users_who_liked: list[str] = []
        for user_id, items in self.user_likes.items():
            if film_id in items:
                users_who_liked.append(user_id)
        
        if not users_who_liked:
            return []
        
        # Find items liked by those users
        candidate_scores: dict[str, float] = {}
        for user_id in users_who_liked:
            user_items = self.user_likes.get(user_id, set())
            for item in user_items:
                if item == film_id:
                    continue
                # Score based on how many users liked both
                candidate_scores[item] = candidate_scores.get(item, 0.0) + 1.0
        
        ranked = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:k]

