import secrets
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd_ctx.hash(p)

def verify_password(p: str, hashed: str) -> bool:
    return pwd_ctx.verify(p, hashed)

def new_qr_uid() -> str:
    # ~26 URL-safe chars; stable size for our VARCHAR(26)
    # token_urlsafe(n) -> ~ ceil(4n/3) chars; n=20 gives ~27-28; we trim to 26
    return secrets.token_urlsafe(20)[:26]
