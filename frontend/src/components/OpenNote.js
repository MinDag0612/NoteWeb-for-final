import React from "react";
import { useState, useEffect } from "react";
import "./OpenNote.css";
import { ReactComponent as RmIcon } from "../assets/RemoveIcon.svg";

export default function OpenNote({
  token,
  noteId,
  title,
  content,
  img,
  onClose,
  onUpdateNote,
}) {
  const [curentContent, setcurentContent] = useState(content);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [images, setImages] = useState(img);


  const handleRmImg = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const imgList = (img) => {
    if (!img || img.length === 0) {
      return <p className="text-muted">Drop image here</p>;
    }

    return (
      <div className="image-grid ">
        {img.map((url, i) => (
          <>
            <div className="image-icon position-relative w-100 h-100">
              <RmIcon
                className="rm-icon position-absolute top-0 end-0 m-2"
                onClick={() => handleRmImg(i)}
              />
              <img
                key={i}
                src={url}
                alt={`img-${i}`}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </>
        ))}
      </div>
    );
  };

  const handleDrop = async (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );

    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file);

        // 🔥 LƯU URL THẬT
        setImages((prev) => [...prev, url]);
      } catch (err) {
        alert("Upload image failed");
      }
    }
  };

  const onSave = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_API_UPDATE_NOTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          noteId,
          newTitle: currentTitle,
          newContent: curentContent,
          newImages: images,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Note can not be update");
      }

      const data = await res.json();
      onUpdateNote(data.note); // 🔥 DÒNG QUYẾT ĐỊNH
      alert("Note was saved!");
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(process.env.REACT_APP_API_IMAGE_UPLOAD, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.url; // secure_url
  };

  return (
    <div className="note-overlay card" onClick={onClose}>
      <div
        className="note-modal d-flex"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          type="text"
          id="title"
          class="form-control form-control-lg mb-1"
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
        />

        <div class="d-flex form-group flex-grow-1 flex-column">
          <textarea
            className="form-control note-textarea"
            id="content"
            type="text"
            value={curentContent}
            onChange={(e) => setcurentContent(e.target.value)}
          />

          <label for="content">Image</label>
          <div
            className="image-box text-center drop-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {imgList(images)}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-info mt-1"
          onClick={() => onSave()}
        >
          Save
        </button>
      </div>
    </div>
  );
}
