def test_login_returns_404_when_user_is_missing(client):
    response = client.post(
        "/login",
        json={"email": "missing@example.com", "password": "irrelevant"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_login_rejects_provider_mismatch(seeded_client):
    response = seeded_client.post(
        "/login",
        json={"email": "google@example.com", "password": "irrelevant"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Please login with google provider"


def test_login_rejects_invalid_password(seeded_client):
    response = seeded_client.post(
        "/login",
        json={"email": "local@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid password"


def test_login_returns_access_token_for_valid_local_user(seeded_client):
    response = seeded_client.post(
        "/login",
        json={"email": "local@example.com", "password": "correct-password"},
    )

    payload = response.json()

    assert response.status_code == 200
    assert payload["status"] == "success"
    assert payload["user"]["email"] == "local@example.com"
    assert payload["user"]["provider"] == "local"
    assert isinstance(payload["access_token"], str)
    assert payload["access_token"]


def test_protected_notes_endpoint_requires_authorization(client):
    response = client.get("/get-notes")

    assert response.status_code == 403


def test_get_notes_returns_only_authenticated_users_notes(seeded_client, seeded_app):
    token = seeded_app.jwt.create_access_token(
        {"sub": "user-1", "email": "local@example.com"}
    )

    response = seeded_client.get(
        "/get-notes",
        headers={"Authorization": f"Bearer {token}"},
    )

    payload = response.json()

    assert response.status_code == 200
    assert payload["status"] == "success"
    assert len(payload["notes"]) == 2
    assert {note["title"] for note in payload["notes"]} == {"Note A", "Note B"}
