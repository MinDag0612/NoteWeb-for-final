import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

url = os.getenv("MONGODB_URI")

class Conn:
    def __init__(self):
        uri = url
        self.client = MongoClient(uri)
        self.db = self.client["WebNote"]  # lấy cái tủ (database)
        self.users = self.db["User"]  # lấy ngăn kéo (collection)
        self.notes = self.db["Note"]  
