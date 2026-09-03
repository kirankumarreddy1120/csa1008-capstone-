import os

class Settings:
    PROJECT_NAME: str = "CivicResource – Intelligent Water and Waste Management Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicresource_secret_key_2026_super_secure_hash")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicresource.db")

settings = Settings()
