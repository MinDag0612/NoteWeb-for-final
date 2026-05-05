import os
import time
from pathlib import Path

from bson import json_util
from dotenv import load_dotenv
from pymongo import MongoClient, ReplaceOne


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("SEED_DB_NAME", "WebNote")
DROP_BEFORE_SEED = os.getenv("SEED_DROP", "false").lower() == "true"
SEED_DIR = Path(__file__).resolve().parent / "seed_data"


def load_jsonl(path: Path):
    documents = []
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if line:
                documents.append(json_util.loads(line))
    return documents


def seed_collection(db, collection_name: str, documents):
    collection = db[collection_name]

    if DROP_BEFORE_SEED:
        collection.drop()

    if not documents:
        print(f"[INFO] No seed documents for {collection_name}")
        return

    operations = [
        ReplaceOne({"_id": document["_id"]}, document, upsert=True)
        for document in documents
    ]
    result = collection.bulk_write(operations)
    print(
        f"[INFO] Seeded {collection_name}: "
        f"matched={result.matched_count}, upserted={len(result.upserted_ids)}, "
        f"modified={result.modified_count}"
    )


def main():
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI is required to seed data")

    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)

    for attempt in range(1, 13):
        try:
            client.admin.command("ping")
            break
        except Exception as exc:
            if attempt == 12:
                raise
            print(f"[INFO] Waiting for MongoDB ({attempt}/12): {exc}")
            time.sleep(5)

    db = client[DB_NAME]

    seed_collection(db, "User", load_jsonl(SEED_DIR / "User.jsonl"))
    seed_collection(db, "Note", load_jsonl(SEED_DIR / "Note.jsonl"))

    print("[INFO] Seed complete")


if __name__ == "__main__":
    main()
