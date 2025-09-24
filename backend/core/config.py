from pydantic_settings import BaseSettings
import os
os.environ.pop("DATABASE_URL", None)

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./taller_diego.db"

    class Config:
        env_file = ".env"

settings = Settings()