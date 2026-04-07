from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str
    
class NoteRequest(BaseModel):
    userId: str
    
class LoginGoogleRequest(BaseModel):
    credential: str
    
class UpdateNoteRequest(BaseModel):
    noteId: str
    newTitle: str
    newContent: str
    newImages: list[str]
    
class DeleteNoteRequest(BaseModel):
    noteId: str