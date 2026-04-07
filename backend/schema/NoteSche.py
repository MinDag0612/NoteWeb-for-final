class Note:
    default_note = lambda userId, create_at: Note(userId, "Title", "Content", [], create_at)
    
    def __init__(self, userId: str, title: str, content: str, img: list[str], creatAt: str):
        self.userId = userId
        self.title = title
        self.content = content
        self.img = img
        self.creatAt = creatAt
    
    def __todict__(self):
        return {
            "user_id": self.userId,
            "title": self.title,
            "content": self.content,
            "img": self.img,
            "created_at": self.creatAt
        }