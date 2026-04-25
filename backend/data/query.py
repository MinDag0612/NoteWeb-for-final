import os
from datetime import datetime

import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient

from backend.schema.NoteSche import Note
from backend.schema.UserSche import UserQuery

load_dotenv()


def get_database(uri: str | None = None):
    resolved_uri = uri or os.getenv("MONGODB_URI")
    if not resolved_uri:
        raise RuntimeError("MONGODB_URI is required to use backend.data.query")

    client = MongoClient(resolved_uri)
    return client["WebNote"]


def create_user(
    email: str,
    password: str | None,
    provider: str,
    full_name: str = "",
    provider_id: str = "",
    uri: str | None = None,
):
    db = get_database(uri)
    users = db["User"]

    hashed_pw = None
    if password:
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
            "utf-8"
        )

    provider_ref = None if provider == "local" else provider_id

    new_user = UserQuery(
        full_name=full_name,
        password=hashed_pw,
        email=email,
        provider=provider,
        provider_id=provider_ref,
    )

    users.insert_one(new_user.__todict__())
    return {"status": "success", "email": email, "provider": provider}


def create_note(user_id: str, uri: str | None = None):
    db = get_database(uri)
    notes = db["Note"]

    new_note = Note.default_note(user_id, datetime.now().strftime("%d/%m/%Y"))
    notes.insert_one(new_note.__todict__())

    return {"status": "success", "user_id": user_id}


if __name__ == "__main__":
    raise SystemExit(
        "This module exposes manual seed helpers. Import and call create_user() "
        "or create_note() explicitly."
    )
