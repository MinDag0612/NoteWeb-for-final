from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from dotenv import load_dotenv
import os

load_dotenv()


# =====================
# CONFIG
# =====================
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")   # ĐỂ TRONG ENV KHI LÊN (ENV)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# print("JWT_SECRET_KEY =", JWT_SECRET_KEY)


security = HTTPBearer()


# =====================
# CREATE TOKEN
# =====================
def create_access_token(
    payload: Dict[str, Any],
    expires_delta: timedelta | None = None
) -> str:
    """
    Create JWT access token
    payload MUST contain 'sub' (userId)
    """

    if "sub" not in payload:
        raise ValueError("Payload must include 'sub' (userId)")

    to_encode = payload.copy()

    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode.update({
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    })

    encoded_jwt = jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return encoded_jwt



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")
        # print("user_id =", user_id)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return payload

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token 1")
    