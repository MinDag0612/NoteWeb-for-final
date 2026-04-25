import importlib
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient


class FakeCollection:
    def __init__(self):
        self.documents = []
        self._next_id = 1

    def reset(self, documents=None):
        self.documents = [dict(doc) for doc in (documents or [])]
        self._next_id = len(self.documents) + 1

    def find_one(self, query):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                return dict(document)
        return None

    def insert_one(self, document):
        created = dict(document)
        created.setdefault("_id", str(self._next_id))
        self._next_id += 1
        self.documents.append(created)
        return SimpleNamespace(inserted_id=created["_id"])

    def find(self, query):
        matches = []
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                matches.append(dict(document))
        return matches

    def update_one(self, query, update):
        for index, document in enumerate(self.documents):
            if all(document.get(key) == value for key, value in query.items()):
                updated = dict(document)
                updated.update(update.get("$set", {}))
                self.documents[index] = updated
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)

    def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if all(document.get(key) == value for key, value in query.items()):
                self.documents.pop(index)
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)


class FakeDatabase:
    def __init__(self):
        self.collections = {
            "User": FakeCollection(),
            "Note": FakeCollection(),
        }

    def __getitem__(self, name):
        return self.collections[name]


class FakeMongoClient:
    def __init__(self, uri):
        self.uri = uri
        self.databases = {"WebNote": FakeDatabase()}

    def __getitem__(self, name):
        return self.databases[name]


@pytest.fixture
def app_module(monkeypatch):
    monkeypatch.setenv("MONGODB_URI", "mongodb://ci-test")
    monkeypatch.setenv("JWT_SECRET_KEY", "ci-test-secret")
    monkeypatch.setenv("CLOUDY_NAME", "ci-cloud")
    monkeypatch.setenv("CLOUDY_API_KEY", "ci-api-key")
    monkeypatch.setenv("CLOUDY_SECRET", "ci-secret")
    monkeypatch.setenv("GG_CLIENT_ID", "ci-google-client")

    import backend.data.conn as conn_module
    import backend.jwt_auth as jwt_auth

    monkeypatch.setattr(conn_module, "url", "mongodb://ci-test")
    monkeypatch.setattr(conn_module, "MongoClient", FakeMongoClient)
    monkeypatch.setattr(jwt_auth, "JWT_SECRET_KEY", "ci-test-secret")

    import backend.main as main_module

    main_module = importlib.reload(main_module)
    monkeypatch.setattr(main_module.jwt, "JWT_SECRET_KEY", "ci-test-secret")

    return main_module


@pytest.fixture
def client(app_module):
    with TestClient(app_module.app) as test_client:
        yield test_client


@pytest.fixture
def seeded_app(app_module):
    app_module.connDB.users.reset(
        [
            {
                "_id": "user-1",
                "full_name": "CI Local User",
                "email": "local@example.com",
                "password": app_module.bcrypt.hashpw(
                    b"correct-password", app_module.bcrypt.gensalt()
                ).decode("utf-8"),
                "provider": "local",
                "provider_id": None,
            },
            {
                "_id": "user-2",
                "full_name": "CI Google User",
                "email": "google@example.com",
                "password": None,
                "provider": "google",
                "provider_id": "google-123",
            },
        ]
    )
    app_module.connDB.notes.reset(
        [
            {
                "_id": "note-1",
                "user_id": "user-1",
                "title": "Note A",
                "content": "Content A",
                "img": [],
                "created_at": "26/04/2026",
            },
            {
                "_id": "note-2",
                "user_id": "user-1",
                "title": "Note B",
                "content": "Content B",
                "img": ["https://example.com/image.png"],
                "created_at": "26/04/2026",
            },
        ]
    )
    return app_module


@pytest.fixture
def seeded_client(seeded_app):
    with TestClient(seeded_app.app) as test_client:
        yield test_client
