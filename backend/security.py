import re
from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt

# ── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY = "CHANGE_ME_IN_PRODUCTION_use_secrets_token_hex_32"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MIN = 30

# ── Password rules ────────────────────────────────────────────────────────────
_RULES = [
    (r".{8,}", "Must be at least 8 characters"),
    (r"[A-Z]", "Must contain at least one uppercase letter"),
    (r"[a-z]", "Must contain at least one lowercase letter"),
    (r"\d", "Must contain at least one number"),
    (r"[^A-Za-z0-9]", "Must contain at least one special character"),
]

def validate_password(password: str) -> list[str]:
    """Return a list of unmet rule descriptions (empty = valid)."""
    return [msg for pattern, msg in _RULES if not re.search(pattern, password)]

# ── Hashing ───────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> str | None:
    """Return the subject (username) or None on any failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None