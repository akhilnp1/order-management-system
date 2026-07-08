from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/orders_db"
    sync_database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/orders_db"
    jwt_secret_key: str = "change-this-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    mock_username: str = "admin"
    mock_password: str = "admin123"
    external_api_url: str = "https://api.frankfurter.app/latest"

    class Config:
        env_file = ".env"


settings = Settings()
