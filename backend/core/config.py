from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./taller_diego.db"

    class Config:
        env_file = f"{os.path.dirname(os.path.dirname(__file__))}/.env"

settings = Settings()