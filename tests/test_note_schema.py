from apps.backend.schema.NoteSche import Note


def test_default_note_builds_expected_serializable_shape():
    note = Note.default_note("user-1", "26/04/2026")

    assert note.__todict__() == {
        "user_id": "user-1",
        "title": "Title",
        "content": "Content",
        "img": [],
        "created_at": "26/04/2026",
    }
