from datetime import timedelta

import pytest
from jose import jwt as jose_jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials


def test_create_access_token_requires_sub(app_module):
    with pytest.raises(ValueError, match="Payload must include 'sub'"):
        app_module.jwt.create_access_token({"email": "missing-sub@example.com"})


def test_create_access_token_embeds_expected_claims(app_module):
    token = app_module.jwt.create_access_token(
        {"sub": "user-1", "email": "local@example.com"}
    )

    payload = jose_jwt.decode(
        token,
        app_module.jwt.JWT_SECRET_KEY,
        algorithms=[app_module.jwt.JWT_ALGORITHM],
    )

    assert payload["sub"] == "user-1"
    assert payload["email"] == "local@example.com"
    assert "iat" in payload
    assert "exp" in payload
    assert payload["exp"] > payload["iat"]


def test_get_current_user_returns_decoded_payload_for_valid_token(app_module):
    token = app_module.jwt.create_access_token(
        {"sub": "user-1", "full_name": "CI Local User"}
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    payload = app_module.jwt.get_current_user(credentials)

    assert payload["sub"] == "user-1"
    assert payload["full_name"] == "CI Local User"


def test_get_current_user_rejects_expired_token(app_module):
    token = app_module.jwt.create_access_token(
        {"sub": "user-1"},
        expires_delta=timedelta(minutes=-1),
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with pytest.raises(HTTPException, match="Token expired"):
        app_module.jwt.get_current_user(credentials)


def test_get_current_user_rejects_tampered_token(app_module):
    token = app_module.jwt.create_access_token({"sub": "user-1"})
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials=f"{token}corrupted"
    )

    with pytest.raises(HTTPException, match="Invalid token 1"):
        app_module.jwt.get_current_user(credentials)
