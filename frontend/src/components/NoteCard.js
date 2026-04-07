import React, { useState } from "react";
import { ReactComponent as RmIcon } from "../assets/RemoveIcon.svg";
import "./NoteCard.css";
import OpenNote from "./OpenNote";

export default function NoteCard({
  token,
  noteId,
  title,
  content,
  img,
  onRemove,
  createAt,
}) {
  const shortText = (str = "", maxLength = 30) => {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState({
    curNoteId: noteId,
    curTitle: title,
    curContent: content,
    curImg: img,
  });

  const handleUpdateNote = (newNote) => {
    setNote({
      curNoteId: newNote.noteId,
      curTitle: newNote.title,
      curContent: newNote.content,
      curImg: newNote.img,
    });
  };

  return (
    <>
      <div
        className="card-area p-0 h-100"
        onClick={() => {
          // console.log(noteId);
          setOpen(true);
        }}
      >
        <div className="card h-100">
          <h3 className="card-header">
            {note.curTitle}{" "}
            <small className="text-muted fs-6">{createAt}</small>
          </h3>

          <div className="card-body d-flex flex-column">
            <p className="card-text">{shortText(note.curContent)}</p>

            <div className="tools mt-auto d-flex flex-row">
              <RmIcon
                className="rm-icon mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {open && (
        <OpenNote
          token={token}
          noteId={noteId}
          title={note.curTitle}
          content={note.curContent}
          img={note.curImg}
          onClose={() => setOpen(false)}
          onUpdateNote={handleUpdateNote}
        />
      )}
    </>
  );
}
