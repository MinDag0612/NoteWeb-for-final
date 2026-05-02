from datetime import datetime
from sympy import content
import schema.schema_req as schema_req
from fastapi.middleware.cors import CORSMiddleware
from  data.conn import Conn
from pathlib import Path
import os

import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests
from bson import ObjectId
from schema.NoteSche import Note
import jwt_auth as jwt
from  schema.UserSche import User
from fastapi import UploadFile, File
import cloudinary
import cloudinary.uploader
from bson import ObjectId
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport import requests
from google.oauth2 import id_token

import apps.backend.jwt_auth as jwt
import apps.backend.schema.schema_req as schema_req
from apps.backend.data.conn import Conn
from apps.backend.schema.NoteSche import Note
from apps.backend.schema.UserSche import User

load_dotenv(Path(__file__).with_name(".env"))

CLOUDY_NAME = os.getenv("CLOUDY_NAME")
CLOUDY_API_KEY = os.getenv("CLOUDY_API_KEY")
CLOUDY_SECRET = os.getenv("CLOUDY_SECRET")
app = FastAPI(
    root_path="/api"
)

# Cấu hình OTLP Exporter để gửi dữ liệu về Collector
otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")
exporter = OTLPMetricExporter(endpoint=otlp_endpoint, insecure=True)

# Thiết lập Meter Provider
reader = PeriodicExportingMetricReader(exporter)
provider = MeterProvider(metric_readers=[reader])
metrics.set_meter_provider(provider)

FastAPIInstrumentor.instrument_app(app)

connDB = Conn()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dangtm.pro",
        "https://www.dangtm.pro"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cloudinary.config(
    cloud_name=CLOUDY_NAME,
    api_key=CLOUDY_API_KEY,
    api_secret=CLOUDY_SECRET,
)


def verify_google_token(credential: str):
    gg_client_id = os.getenv("GG_CLIENT_ID")  # CLIENT_ID từ Google Cloud Console
    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            gg_client_id  # CLIENT_ID từ Google Cloud Console
        )

        # idinfo LÚC NÀY ĐÃ ĐƯỢC VERIFY
        return {
            "google_id": idinfo["sub"],      # dùng làm providerId
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "email_verified": idinfo.get("email_verified"),
        }

    except ValueError:
        # Token sai / hết hạn / bị sửa
        return None

@app.get("/")
def health_check():
    return {"status": "API is running"}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(
        file.file,
        folder="NoteWeb"
    )
    return {
        "url": result["secure_url"]
    }

@app.post("/login")
def login(loginReq: schema_req.LoginRequest):
    # Find by email
    user = connDB.users.find_one({"email": loginReq.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
      
    if user["provider"] != "local":
        raise HTTPException(status_code=400, detail=f"Please login with {user['provider']} provider")

    # Check password
    if not bcrypt.checkpw(loginReq.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    userOb =  User(
        full_name = user["full_name"],
        email = user["email"],
        provider = user["provider"],
        provider_id = user["provider_id"]
    )
    
    token = jwt.create_access_token(
        payload = {
            "sub": user["_id"],
            "full_name": userOb.full_name,
            "email": userOb.email,
        }
    )

    return {"status": "success", "user": userOb.__todict__(), "access_token": token}
    
@app.post("/login-google")
def login_google(loginReq: schema_req.LoginGoogleRequest):
    # Verify token
    google_user = verify_google_token(loginReq.credential)
    if not google_user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = connDB.users.find_one({"email": google_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found, please register first")
    user["_id"] = str(user["_id"])
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")
    
    if user["provider"] != "google":
        raise HTTPException(status_code=400, detail=f"Please login with {user['provider']} provider")
    
    userOb =  User(
        full_name = user["full_name"],
        email = user["email"],
        provider = user["provider"],
        provider_id = user["provider_id"]
    )
    
    token = jwt.create_access_token(
        payload = {
            "sub": str(user["_id"]),
            "full_name": userOb.full_name,
            "email": userOb.email,
        }
    )
      
    return {"status": "success", "user": userOb.__todict__(), "access_token": token}
    
@app.post("/create-note")
def create_note(user: dict = Depends(jwt.get_current_user)):
    new_note = Note.default_note(user["sub"], datetime.now().strftime("%d/%m/%Y"))
    result = connDB.notes.insert_one(new_note.__todict__())
    
    note = connDB.notes.find_one({"_id": result.inserted_id})
    
    return {
        "status": "success",
        "note": {
            "noteId": str(note["_id"]),   # ✅ QUAN TRỌNG
            "title": note["title"],
            "content": note["content"],
            "img": note["img"],
        }
    }

@app.get("/get-notes")
def get_notes(user: dict = Depends(jwt.get_current_user)):
    user_id = user["sub"]
    notes_cursor = connDB.notes.find({"user_id": user_id})
    notes = []
    for note in notes_cursor:
        notes.append({
            "noteId": str(note["_id"]),
            "title": note["title"],
            "content": note["content"],
            "img": note["img"],
            "created_at": note["created_at"]
        })
    return {"status": "success", "notes": notes}

@app.post("/notes/update")
def update_note(noteReq: schema_req.UpdateNoteRequest, user: dict = Depends(jwt.get_current_user)):
    user_id = user["sub"]
    note = connDB.notes.find_one({"_id": ObjectId(noteReq.noteId)})
    
    if not note or note["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_result = connDB.notes.update_one(
        {"_id": ObjectId(noteReq.noteId)},
        {"$set": {
            "title": noteReq.newTitle,
            "content": noteReq.newContent,
            "img": noteReq.newImages
        }}
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"status": "success", "note": {
        "noteId": noteReq.noteId,
        "title": noteReq.newTitle,
        "content": noteReq.newContent,
        "img": noteReq.newImages,
    }}

@app.delete("/delete-note")
def delete_note(noteReq: schema_req.DeleteNoteRequest, user: dict = Depends(jwt.get_current_user)):
    user_id = user["sub"]
    note = connDB.notes.find_one({"_id": ObjectId(noteReq.noteId)})

    if not note or note["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Note not found")

    delete_result = connDB.notes.delete_one({"_id": ObjectId(noteReq.noteId)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "success", "message": "Note deleted successfully"}

