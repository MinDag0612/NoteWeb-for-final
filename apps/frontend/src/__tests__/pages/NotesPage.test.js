import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NotesPage from "../../pages/NotesPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("../../components/NoteCard", () => (props) => (
  <div data-testid={`note-card-${props.noteId}`}>
    <span>{props.title}</span>
    <button type="button" onClick={props.onRemove}>
      Delete {props.noteId}
    </button>
  </div>
));

function makeJsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    headers: {
      get: jest.fn((header) =>
        header.toLowerCase() === "content-type" ? "application/json" : null,
      ),
    },
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("NotesPage", () => {
  beforeEach(() => {
    process.env.REACT_APP_API_NOTES = "/api/get-notes";
    process.env.REACT_APP_API_ADD_NOTE = "/api/create-note";
    process.env.REACT_APP_API_DELETE_NOTE = "/api/delete-note";
    global.fetch = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
    sessionStorage.clear();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  test("loads and renders notes for the authenticated user", async () => {
    global.fetch.mockResolvedValueOnce(
      makeJsonResponse({
        notes: [
          {
            noteId: "note-1",
            title: "First note",
            content: "Content A",
            img: [],
            created_at: "26/04/2026",
          },
        ],
      }),
    );

    render(<NotesPage token="token-123" />);

    expect(await screen.findByText("First note")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/get-notes", {
      headers: {
        Authorization: "Bearer token-123",
      },
    });
  });

  test("adds a note to the rendered list after a successful create request", async () => {
    global.fetch
      .mockResolvedValueOnce(makeJsonResponse({ notes: [] }))
      .mockResolvedValueOnce(
        makeJsonResponse({
          note: {
            noteId: "note-3",
            title: "New note",
            content: "Fresh content",
            img: [],
          },
        }),
      );

    render(<NotesPage token="token-123" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(await screen.findByText("New note")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenLastCalledWith(
      "/api/create-note",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-123",
        },
      }),
    );
  });

  test("removes a note from the UI after a successful delete request", async () => {
    global.fetch
      .mockResolvedValueOnce(
        makeJsonResponse({
          notes: [
            {
              noteId: "note-9",
              title: "Delete me",
              content: "Disposable note",
              img: [],
              created_at: "26/04/2026",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(makeJsonResponse({ status: "success" }));

    render(<NotesPage token="token-123" />);

    expect(await screen.findByText("Delete me")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete note-9" }));

    await waitFor(() => {
      expect(screen.queryByText("Delete me")).not.toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenLastCalledWith(
      "/api/delete-note",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-123",
        },
        body: JSON.stringify({ noteId: "note-9" }),
      }),
    );
  });

  test("redirects to login when the session token is rejected by the API", async () => {
    global.fetch.mockResolvedValueOnce(
      makeJsonResponse({ detail: "Token expired" }, { ok: false, status: 401 }),
    );

    render(<NotesPage token="token-123" />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    expect(sessionStorage.getItem("error")).toBe("Login session expired");
  });

  test("alerts when creating a note fails", async () => {
    global.fetch
      .mockResolvedValueOnce(makeJsonResponse({ notes: [] }))
      .mockResolvedValueOnce(
        makeJsonResponse({ detail: "Create failed" }, { ok: false, status: 500 }),
      );

    render(<NotesPage token="token-123" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "+" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Add note failed");
    });
  });
});
