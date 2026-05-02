def test_login_google_returns_access_token_for_valid_google_user(
    seeded_client, seeded_app, monkeypatch
):
    monkeypatch.setattr(
        seeded_app,
        "verify_google_token",
        lambda credential: {
            "google_id": "google-123",
            "email": "google@example.com",
            "name": "CI Google User",
            "picture": "https://example.com/avatar.png",
            "email_verified": True,
        },
    )

    response = seeded_client.post(
        "/login-google",
        json={"credential": "valid-google-token"},
    )

    payload = response.json()

    assert response.status_code == 200
    assert payload["status"] == "success"
    assert payload["user"]["email"] == "google@example.com"
    assert payload["user"]["provider"] == "google"
    assert isinstance(payload["access_token"], str)
    assert payload["access_token"]


def test_login_google_rejects_invalid_google_token(
    seeded_client, seeded_app, monkeypatch
):
    monkeypatch.setattr(seeded_app, "verify_google_token", lambda credential: None)

    response = seeded_client.post(
        "/login-google",
        json={"credential": "invalid-google-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Google token"


def test_login_google_returns_404_when_verified_google_user_is_missing(
    seeded_client, seeded_app, monkeypatch
):
    monkeypatch.setattr(
        seeded_app,
        "verify_google_token",
        lambda credential: {
            "google_id": "google-999",
            "email": "missing-google@example.com",
            "name": "Missing User",
            "picture": None,
            "email_verified": True,
        },
    )

    response = seeded_client.post(
        "/login-google",
        json={"credential": "valid-google-token"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found, please register first"


def test_login_google_rejects_provider_mismatch_for_existing_local_user(
    seeded_client, seeded_app, monkeypatch
):
    monkeypatch.setattr(
        seeded_app,
        "verify_google_token",
        lambda credential: {
            "google_id": "google-000",
            "email": "local@example.com",
            "name": "CI Local User",
            "picture": None,
            "email_verified": True,
        },
    )

    response = seeded_client.post(
        "/login-google",
        json={"credential": "valid-google-token"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Please login with local provider"
