def test_upload_image_returns_secure_url(client, app_module, monkeypatch):
    uploaded = {}

    def fake_upload(file_obj, folder):
        uploaded["file_obj"] = file_obj
        uploaded["folder"] = folder
        return {"secure_url": "https://cdn.example.com/note.png"}

    monkeypatch.setattr(app_module.cloudinary.uploader, "upload", fake_upload)

    response = client.post(
        "/upload-image",
        files={"file": ("note.png", b"image-bytes", "image/png")},
    )

    assert response.status_code == 200
    assert response.json() == {"url": "https://cdn.example.com/note.png"}
    assert uploaded["folder"] == "NoteWeb"
    assert uploaded["file_obj"] is not None
