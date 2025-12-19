from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password safely with bcrypt.
    Handles passwords longer than 72 bytes by first hashing with SHA256.
    This keeps full password entropy and avoids bcrypt truncation.
    """
    # Convert password to SHA256 hex digest (always 64 bytes)
    sha256_pw = hashlib.sha256(password.encode('utf-8')).hexdigest()
    safe_pw = sha256_pw[:72]
    return pwd_context.hash(safe_pw)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash.
    Uses same SHA256 pre-hash to handle long passwords safely.
    """
    sha256_pw = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(sha256_pw, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
