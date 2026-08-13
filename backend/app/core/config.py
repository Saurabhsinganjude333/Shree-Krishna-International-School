import os


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_SECRET_IN_PRODUCTION_ENV_VAR")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SCHOOL_NAME: str = "Shree Krishna International School"
    SCHOOL_CODE: str = "11654"
    AFFILIATION_NO: str = "430563"
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()
