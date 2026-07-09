from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f"{os.path.dirname(os.path.dirname(__file__))}/.env"
    )

    DATABASE_URL: str = "sqlite:///./taller_diego.db"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    JWT_SECRET: str = ""

settings = Settings()
