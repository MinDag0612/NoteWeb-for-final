import React, { useState, useEffect } from "react";
import NoteCard from "../components/NoteCard";
import "./NotesPageStyle.css";
import { useNavigate } from "react-router-dom";

export default function NotesPage({ token }) {
  const [notes, setNotes] = useState([]);
  const navigator = useNavigate();

  const onRemove = async (noteId) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;

    try {
      const res = await fetch(process.env.REACT_APP_API_DELETE_NOTE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ noteId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Delete not complete !!");
      }

      const data = await res.json();
      // console.log(data);

      setNotes((prev) => prev.filter((n) => n.noteId !== noteId));
    } catch (error) {
      alert(error.message);
    }
  };

  const onAddNote = async () => {
    const res = await fetch(process.env.REACT_APP_API_ADD_NOTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Add note failed");
      return;
    }

    const data = await res.json();

    // 👇 CẬP NHẬT STATE NGAY
    setNotes((prev) => [...prev, data.note]);
  };

  const fetchNotes = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_NOTES, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          if (res.status === 401) {
            sessionStorage.setItem("error", "Login session expired");
            navigator("/");
            return;
          }

          if (contentType?.includes("application/json")) {
            const err = await res.json();
            throw new Error(err.detail || "Request failed");
          }

          throw new Error("Request failed");
        }

        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid server response");
        }

        const data = await res.json();
        console.log(data.notes)
        setNotes(data.notes);
      } catch (err) {
        console.error("Fetch notes error:", err);
        alert(err.message);
      }
    };

  useEffect(() => {
    if (!token) return;

    fetchNotes();
    // console.log("TOKEN SENT:", token);
  }, [token, navigator]);

  return (
    <>
      <div className="notes-page d-flex flex-column flex-grow-1 min-h-0">
        <div className="notes-container flex-grow-1 min-h-0 p-3">
          <div className="row gx-3 gy-3 m-0">
            {notes.map((item) => (
              <div className="col-3" key={item.noteId}>
                <NoteCard
                  token={token}
                  noteId={item.noteId}
                  title={item.title}
                  content={item.content}
                  createAt={item.created_at}
                  img={item.img}
                  onRemove={() => onRemove(item.noteId)}
                />
              </div>
            ))}
          </div>
        </div>
        <button className="add-btn fab-btn" onClick={onAddNote}>
          +
        </button>
      </div>
    </>
  );
}
