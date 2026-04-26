import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OpenNote from "./OpenNote";

jest.mock("../assets/RemoveIcon.svg", () => ({
  ReactComponent: (props) => (
    <button type="button" aria-label="Remove image" {...props} />
  ),
}));

function makeJsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("OpenNote", () => {
  beforeEach(() => {
    process.env.REACT_APP_API_UPDATE_NOTE = "/api/notes/update";
    global.fetch = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("submits edited note content and notifies the parent with the saved note", async () => {
    const onClose = jest.fn();
    const onUpdateNote = jest.fn();

    global.fetch.mockResolvedValueOnce(
      makeJsonResponse({
        note: {
          noteId: "note-1",
          title: "Updated title",
          content: "Updated content",
          img: ["https://example.com/updated.png"],
        },
      }),
    );

    render(
      <OpenNote
        token="token-123"
        noteId="note-1"
        title="Old title"
        content="Old content"
        img={["https://example.com/updated.png"]}
        onClose={onClose}
        onUpdateNote={onUpdateNote}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Old title"), {
      target: { value: "Updated title" },
    });
    fireEvent.change(screen.getByDisplayValue("Old content"), {
      target: { value: "Updated content" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onUpdateNote).toHaveBeenCalledWith({
        noteId: "note-1",
        title: "Updated title",
        content: "Updated content",
        img: ["https://example.com/updated.png"],
      });
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/notes/update",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-123",
        },
        body: JSON.stringify({
          noteId: "note-1",
          newTitle: "Updated title",
          newContent: "Updated content",
          newImages: ["https://example.com/updated.png"],
        }),
      }),
    );
    expect(window.alert).toHaveBeenCalledWith("Note was saved!");
    expect(onClose).toHaveBeenCalled();
  });

  test("removes an image from local state before saving", async () => {
    const onClose = jest.fn();
    const onUpdateNote = jest.fn();

    global.fetch.mockResolvedValueOnce(
      makeJsonResponse({
        note: {
          noteId: "note-2",
          title: "Title",
          content: "Content",
          img: [],
        },
      }),
    );

    render(
      <OpenNote
        token="token-123"
        noteId="note-2"
        title="Title"
        content="Content"
        img={["https://example.com/image.png"]}
        onClose={onClose}
        onUpdateNote={onUpdateNote}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remove image/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
      noteId: "note-2",
      newTitle: "Title",
      newContent: "Content",
      newImages: [],
    });
  });
});
