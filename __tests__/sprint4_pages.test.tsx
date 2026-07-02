import React from "react";
import { render, screen } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Shared flexible mock — we mutate mockGetParam per describe block
// ---------------------------------------------------------------------------
const mockGetParam = jest.fn<string | null, [string]>(() => null);

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => ({ get: mockGetParam }),
  useParams: () => ({}),
}));

// apiFetch mock so pages don't make real network calls
jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    details: any;
    constructor(opts: any) {
      super(opts.message);
      this.status = opts.status;
      this.details = opts;
    }
  },
  setClientToken: jest.fn(),
  clearStoredToken: jest.fn(),
  setStoredToken: jest.fn(),
  getApiBase: () => "http://localhost:5000",
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------
import LoginClient from "@/components/LoginClient";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/reset-password/page";

// ---------------------------------------------------------------------------
// LoginClient — session-expired banner
// ---------------------------------------------------------------------------
describe("LoginClient — session-expired banner", () => {
  beforeEach(() => {
    // Simulate ?reason=session_expired
    mockGetParam.mockImplementation((key) =>
      key === "reason" ? "session_expired" : null
    );
  });

  afterEach(() => {
    mockGetParam.mockReset();
  });

  it("shows session-expired message", () => {
    render(<LoginClient />);
    expect(screen.getByText(/your session expired/i)).toBeInTheDocument();
  });

  it("shows 'Forgot password?' link", () => {
    render(<LoginClient />);
    expect(
      screen.getByRole("link", { name: /forgot password/i })
    ).toBeInTheDocument();
  });

  it("shows 'Create account' link", () => {
    render(<LoginClient />);
    expect(
      screen.getByRole("link", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("does NOT show session-expired message when reason is absent", () => {
    mockGetParam.mockReturnValue(null);
    render(<LoginClient />);
    expect(screen.queryByText(/your session expired/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ForgotPasswordPage — renders
// ---------------------------------------------------------------------------
describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockGetParam.mockReturnValue(null);
  });

  it("renders email input", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByPlaceholderText(/you@example\.com/i)
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("renders a back-to-sign-in link", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("link", { name: /back to sign in/i })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ResetPasswordPage — valid URL params (token + email present)
// ---------------------------------------------------------------------------
describe("ResetPasswordPage — valid URL params", () => {
  beforeEach(() => {
    mockGetParam.mockImplementation((key) => {
      if (key === "token") return "test-reset-token-abc123";
      if (key === "email") return "test@example.com";
      return null;
    });
  });

  it("renders the set-new-password heading", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText(/set a new password/i)).toBeInTheDocument();
  });

  it("renders new password input", () => {
    render(<ResetPasswordPage />);
    expect(
      screen.getByPlaceholderText(/at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ResetPasswordPage />);
    expect(
      screen.getByRole("button", { name: /set new password/i })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ResetPasswordPage — missing URL params → invalid link state
// ---------------------------------------------------------------------------
describe("ResetPasswordPage — missing URL params", () => {
  beforeEach(() => {
    mockGetParam.mockReturnValue(null);
  });

  it("shows invalid-or-incomplete message", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText(/invalid or incomplete/i)).toBeInTheDocument();
  });
});
