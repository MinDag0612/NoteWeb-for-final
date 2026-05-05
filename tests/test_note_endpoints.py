from bson import ObjectId


def auth_headers(app_module, user_id="user-1", email="local@example.com"):
    token = app_module.jwt.create_access_token({"sub": user_id, "email": email})
    return {"Authorization": f"Bearer {token}"}


def test_create_note_persists_default_note_for_authenticated_user(
    seeded_client, seeded_app
):
    response = seeded_client.post(
        "/create-note",
        headers=auth_headers(seeded_app),
    )

    payload = response.json()
    created_note = seeded_app.connDB.notes.documents[-1]

    assert response.status_code == 200
    assert payload["status"] == "success"
    assert payload["note"]["title"] == "Title"
    assert payload["note"]["content"] == "Content"
    assert payload["note"]["img"] == []
    assert created_note["user_id"] == "user-1"
    assert created_note["title"] == "Title"
    assert created_note["content"] == "Content"


def test_update_note_updates_owned_note(seeded_client, seeded_app):
    note_id = ObjectId()
    seeded_app.connDB.notes.reset(
        [
            {
                "_id": note_id,
                "user_id": "user-1",
                "title": "Original title",
                "content": "Original content",
                "img": [],
                "created_at": "26/04/2026",
            }
        ]
    )

    response = seeded_client.post(
        "/notes/update",
        json={
            "noteId": str(note_id),
            "newTitle": "Updated title",
            "newContent": "Updated content",
            "newImages": ["https://example.com/updated.png"],
        },
        headers=auth_headers(seeded_app),
    )

    payload = response.json()
    stored_note = seeded_app.connDB.notes.find_one({"_id": note_id})

    assert response.status_code == 200
    assert payload["status"] == "success"
    assert payload["note"]["title"] == "Updated title"
    assert payload["note"]["content"] == "Updated content"
    assert payload["note"]["img"] == ["https://example.com/updated.png"]
    assert stored_note["title"] == "Updated title"
    assert stored_note["content"] == "Updated content"
    assert stored_note["img"] == ["https://example.com/updated.png"]


def test_update_note_rejects_note_owned_by_another_user(seeded_client, seeded_app):
    note_id = ObjectId()
    seeded_app.connDB.notes.reset(
        [
            {
                "_id": note_id,
                "user_id": "user-2",
                "title": "Foreign note",
                "content": "Do not allow update",
                "img": [],
                "created_at": "26/04/2026",
            }
        ]
    )

    response = seeded_client.post(
        "/notes/update",
        json={
            "noteId": str(note_id),
            "newTitle": "Blocked title",
            "newContent": "Blocked content",
            "newImages": [],
        },
        headers=auth_headers(seeded_app),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found"


def test_delete_note_removes_owned_note(seeded_client, seeded_app):
    note_id = ObjectId()
    seeded_app.connDB.notes.reset(
        [
            {
                "_id": note_id,
                "user_id": "user-1",
                "title": "Disposable note",
                "content": "Delete me",
                "img": [],
                "created_at": "26/04/2026",
            }
        ]
    )

    response = seeded_client.request(
        "DELETE",
        "/delete-note",
        json={"noteId": str(note_id)},
        headers=auth_headers(seeded_app),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert seeded_app.connDB.notes.documents == []


def test_delete_note_rejects_note_owned_by_another_user(seeded_client, seeded_app):
    note_id = ObjectId()
    seeded_app.connDB.notes.reset(
        [
            {
                "_id": note_id,
                "user_id": "user-2",
                "title": "Protected note",
                "content": "Should not be deleted",
                "img": [],
                "created_at": "26/04/2026",
            }
        ]
    )

    response = seeded_client.request(
        "DELETE",
        "/delete-note",
        json={"noteId": str(note_id)},
        headers=auth_headers(seeded_app),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found"
