from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    app_name: str = "ReLink Backend"
    env: str = "dev"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "mysql+mysqlconnector://relink:relinkpass@127.0.0.1:3306/relink"
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()
