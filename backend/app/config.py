from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    allowed_origins: str = "http://localhost:3000"
    recs_default_k: int = 20
    recs_hybrid_alpha: float = 0.5  # weight for content vs collab (alpha*content + (1-alpha)*collab)

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()

