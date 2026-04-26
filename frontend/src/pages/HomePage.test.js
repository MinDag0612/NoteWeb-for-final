import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("./NotesPage", () => ({ token }) => (
  <div data-testid="notes-page">Notes token: {token}</div>
));

describe("HomePage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test("redirects to login when the user session is missing", async () => {
    render(<HomePage />);

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(sessionStorage.getItem("error")).toBe("Please login before !");
  });

  test("redirects to login when the token is missing", async () => {
    sessionStorage.setItem(
      "user",
      JSON.stringify({ full_name: "CI User", email: "local@example.com" }),
    );

    render(<HomePage />);

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(sessionStorage.getItem("error")).toBe(
      "Something went wrong, token not found",
    );
  });

  test("renders the user header and notes page when session data exists", async () => {
    sessionStorage.setItem(
      "user",
      JSON.stringify({ full_name: "CI User", email: "local@example.com" }),
    );
    sessionStorage.setItem("access_token", "token-123");

    render(<HomePage />);

    expect(await screen.findByText("CI User")).toBeInTheDocument();
    expect(screen.getByTestId("notes-page")).toHaveTextContent(
      "Notes token: token-123",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
