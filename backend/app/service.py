from __future__ import annotations

from .config import settings
from .models import Film, RecommendationItem, RecommendationsResponse
from .recommenders import (
    CollaborativeItemItemRecommender,
    CollaborativeUserUserRecommender,
    ContentBasedRecommender,
    FilmRow,
)
from .repo import filmrow_to_public


class RecommendationService:
    def __init__(self) -> None:
        self._films: list[FilmRow] = []
        self._film_by_id: dict[str, FilmRow] = {}
        self._content: ContentBasedRecommender | None = None
        self._collab_item: CollaborativeItemItemRecommender | None = None
        self._collab_user: CollaborativeUserUserRecommender | None = None

    def rebuild(
        self,
        films: list[FilmRow],
        user_likes: dict[str, set[str]],
    ) -> None:
        self._films = films
        self._film_by_id = {f.id: f for f in films}
        self._content = ContentBasedRecommender(films) if films else None
        self._collab_item = CollaborativeItemItemRecommender(user_likes) if user_likes else None
        self._collab_user = CollaborativeUserUserRecommender(user_likes) if user_likes else None

    def _film(self, film_id: str) -> Film | None:
        f = self._film_by_id.get(film_id)
        if not f:
            return None
        return Film(**filmrow_to_public(f))

    @staticmethod
    def _blend_scores(
        content_pairs: list[tuple[str, float]],
        collab_pairs: list[tuple[str, float]],
        alpha: float,
        k: int,
    ) -> list[tuple[str, float]]:
        """
        Blend scores as: alpha * content + (1 - alpha) * collab.
        Falls back gracefully if one source is empty.
        """
        scores: dict[str, float] = {}
        for fid, s in content_pairs:
            scores[fid] = scores.get(fid, 0.0) + alpha * s
        for fid, s in collab_pairs:
            scores[fid] = scores.get(fid, 0.0) + (1.0 - alpha) * s
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:k]

    def recommend_for_user(
        self,
        user_id: str,
        liked_film_ids: list[str],
        algorithm: str,
        k: int | None = None,
    ) -> RecommendationsResponse:
        k = k or settings.recs_default_k
        liked_set = set(liked_film_ids)

        if algorithm == "content":
            pairs = self._content.recommend_for_user(liked_film_ids, k=k) if self._content else []
        elif algorithm == "collab":
            # Default to item-based collaborative filtering
            pairs = self._collab_item.recommend_for_user(liked_film_ids, k=k) if self._collab_item else []
        elif algorithm == "collab-item":
            pairs = self._collab_item.recommend_for_user(liked_film_ids, k=k) if self._collab_item else []
        elif algorithm == "collab-user":
            pairs = self._collab_user.recommend_for_user(user_id, liked_film_ids, k=k) if self._collab_user else []
        elif algorithm == "hybrid":
            content_pairs = self._content.recommend_for_user(liked_film_ids, k=k) if self._content else []
            collab_pairs = self._collab_item.recommend_for_user(liked_film_ids, k=k) if self._collab_item else []
            # If only one source is available, just return that one
            if content_pairs and collab_pairs:
                pairs = self._blend_scores(content_pairs, collab_pairs, settings.recs_hybrid_alpha, k)
            elif content_pairs:
                pairs = content_pairs[:k]
            else:
                pairs = collab_pairs[:k]
        else:
            raise ValueError("Unknown algorithm")

        items: list[RecommendationItem] = []
        for fid, score in pairs:
            if fid in liked_set:
                continue
            film = self._film(fid)
            if not film:
                continue
            items.append(RecommendationItem(film=film, score=score))

        return RecommendationsResponse(userId=user_id, algorithm=algorithm, items=items)

    def similar_films(
        self,
        film_id: str,
        algorithm: str,
        k: int | None = None,
    ) -> RecommendationsResponse:
        k = k or settings.recs_default_k

        if algorithm == "content":
            pairs = self._content.similar_items(film_id, k=k) if self._content else []
        elif algorithm == "collab":
            # Default to item-based collaborative filtering
            pairs = self._collab_item.similar_items(film_id, k=k) if self._collab_item else []
        elif algorithm == "collab-item":
            pairs = self._collab_item.similar_items(film_id, k=k) if self._collab_item else []
        elif algorithm == "collab-user":
            pairs = self._collab_user.similar_items(film_id, k=k) if self._collab_user else []
        elif algorithm == "hybrid":
            content_pairs = self._content.similar_items(film_id, k=k) if self._content else []
            collab_pairs = self._collab_item.similar_items(film_id, k=k) if self._collab_item else []
            if content_pairs and collab_pairs:
                pairs = self._blend_scores(content_pairs, collab_pairs, settings.recs_hybrid_alpha, k)
            elif content_pairs:
                pairs = content_pairs[:k]
            else:
                pairs = collab_pairs[:k]
        else:
            raise ValueError("Unknown algorithm")

        items: list[RecommendationItem] = []
        for fid, score in pairs:
            film = self._film(fid)
            if not film:
                continue
            items.append(RecommendationItem(film=film, score=score))

        return RecommendationsResponse(seedFilmId=film_id, algorithm=algorithm, items=items)


recs = RecommendationService()

