from pydantic import BaseModel
from typing import Optional
from typing_extensions import Literal

class UserQuery(BaseModel):
    full_name: str
    password: Optional[str] = None
    email: str
    provider: Literal["local", "google"] = "local"
    provider_id: Optional[str] = None
    
    def __todict__(self):
        return {
            "full_name": self.full_name,
            "password": self.password,
            "email": self.email,
            "provider": self.provider,
            "provider_id": self.provider_id
        }
        
class User(BaseModel):
    full_name: str
    email: str
    provider: Literal["local", "google"] = "local"
    provider_id: Optional[str] = None
    
    def __todict__(self):
        return {
            "full_name": self.full_name,
            "email": self.email,
            "provider": self.provider,
            "provider_id": self.provider_id
        }