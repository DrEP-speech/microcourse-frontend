import React from "react";
import { render, screen } from "@testing-library/react";

// next/navigation mock
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/register",
  useSearchParams: () => ({ get: () => null }),
  useParams: () => ({}),
}));

// apiFetch mock
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
}));

// Import named exports — no module isolation needed
import { RegisterForm, isBetaAccessRequired } from "../components/RegisterForm";

// ---------------------------------------------------------------------------
// isBetaAccessRequired helper
// ---------------------------------------------------------------------------
describe("isBetaAccessRequired()", () => {
  it("returns false when env var is absent", () => {
    const orig = process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED;
    delete process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED;
    expect(isBetaAccessRequired()).toBe(false);
    process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED = orig as string;
  });

  it("returns false when env var is not \'true\'", () => {
    const orig = process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED;
    process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED = "false";
    expect(isBetaAccessRequired()).toBe(false);
    process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED = orig as string;
  });

  it("returns true when env var is \'true\'", () => {
    const orig = process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED;
    process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED = "true";
    expect(isBetaAccessRequired()).toBe(true);
    process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED = orig as string;
  });
});

// ---------------------------------------------------------------------------
// RegisterForm — betaGate prop = false
// ---------------------------------------------------------------------------
describe("RegisterForm \u2014 betaGate=false", () => {
  it("does NOT render the invite code input", () => {
    render(<RegisterForm betaGate={false} />);
    expect(screen.queryByTestId("invite-code-input")).not.toBeInTheDocument();
  });

  it("renders the beta notice banner", () => {
    render(<RegisterForm betaGate={false} />);
    expect(screen.getByText(/beta notice/i)).toBeInTheDocument();
  });

  it("renders the Create account submit button", () => {
    render(<RegisterForm betaGate={false} />);
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// RegisterForm — betaGate prop = true
// ---------------------------------------------------------------------------
describe("RegisterForm \u2014 betaGate=true", () => {
  it("renders the invite code input", () => {
    render(<RegisterForm betaGate={true} />);
    expect(screen.getByTestId("invite-code-input")).toBeInTheDocument();
  });

  it("invite code input has correct placeholder", () => {
    render(<RegisterForm betaGate={true} />);
    expect(
      screen.getByPlaceholderText(/enter your invite code/i)
    ).toBeInTheDocument();
  });
});
