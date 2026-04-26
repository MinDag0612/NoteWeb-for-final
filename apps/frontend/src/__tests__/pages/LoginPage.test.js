import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "../../pages/LoginPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("../../components/GoogleLogin", () => () => (
  <div data-testid="google-login">Google Login</div>
));

function makeJsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("LoginPage", () => {
  beforeEach(() => {
    process.env.REACT_APP_API_PROCESS_LOGIN = "/api/login";
    global.fetch = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    sessionStorage.clear();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  test("submits credentials, stores the session, and navigates to home", async () => {
    global.fetch.mockResolvedValueOnce(
      makeJsonResponse({
        user: { full_name: "CI User", email: "local@example.com", provider: "local" },
        access_token: "token-123",
      }),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "local@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "local@example.com",
          password: "correct-password",
        }),
      }),
    );
    expect(JSON.parse(sessionStorage.getItem("user"))).toEqual(
      expect.objectContaining({
        full_name: "CI User",
        email: "local@example.com",
      }),
    );
    expect(sessionStorage.getItem("access_token")).toBe("token-123");
  });

  test("alerts the API error and keeps the user on the login page", async () => {
    global.fetch.mockResolvedValueOnce(
      makeJsonResponse(
        { detail: "Invalid password" },
        { ok: false, status: 401 },
      ),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "local@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid password");
    });
    expect(screen.getByText(/first time you here/i)).toBeInTheDocument();
    expect(sessionStorage.getItem("access_token")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows and clears the session error banner on mount", () => {
    sessionStorage.setItem("error", "Please login before !");

    render(<LoginPage />);

    expect(screen.getByText("Please login before !")).toBeInTheDocument();
    expect(sessionStorage.getItem("error")).toBeNull();
  });
});
