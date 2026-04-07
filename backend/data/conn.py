from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("MONGODB_URI")

class Conn:
    def __init__(self):
        uri = url
        self.client = MongoClient(uri)
        self.db = self.client["WebNote"]  # lấy cái tủ (database)
        self.users = self.db["User"]  # lấy ngăn kéo (collection)
        self.notes = self.db["Note"]  