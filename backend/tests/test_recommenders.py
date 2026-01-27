import math

from app.recommenders import (
    CollaborativeItemItemRecommender,
    ContentBasedRecommender,
    FilmRow,
)


def test_content_based_similar_and_user_recs():
    films = [
        FilmRow(id="a", title="Star Wars", director="Lucas", genre="Sci-Fi", imageUrl=None, year=1977),
        FilmRow(id="b", title="Empire Strikes Back", director="Lucas", genre="Sci-Fi", imageUrl=None, year=1980),
        FilmRow(id="c", title="When Harry Met Sally", director="Reiner", genre="RomCom", imageUrl=None, year=1989),
    ]
    rec = ContentBasedRecommender(films)

    # Similar items for film a should favor b over c
    sims = rec.similar_items("a", k=2)
    assert sims and sims[0][0] == "b"

    # User liked a -> recommend b
    user_recs = rec.recommend_for_user(["a"], k=2)
    ids = [fid for fid, _ in user_recs]
    assert "b" in ids
    assert user_recs[0][0] == "b"


def test_collaborative_item_item_recs():
    user_likes = {
        "u1": {"a", "b"},
        "u2": {"a", "c"},
        "u3": {"b", "c"},
    }
    rec = CollaborativeItemItemRecommender(user_likes)

    sims = rec.similar_items("a", k=2)
    ids = [fid for fid, _ in sims]
    assert set(ids) == {"b", "c"}

    # Recommend for user who liked only a -> should get both b and c
    recs = rec.recommend_for_user(["a"], k=2)
    ids = [fid for fid, _ in recs]
    assert set(ids) == {"b", "c"}
    # scores should be finite positive numbers
    assert all(score > 0 and math.isfinite(score) for _, score in recs)
