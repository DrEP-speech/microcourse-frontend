// Replaced: the original DashboardClient test referenced a component that
// does not exist. This file now tests SiteNav, a real stable component.
//
// Global mocks (next/link, next/navigation) are set up in jest.setup.ts.
// lib/auth.getToken() reads localStorage; jsdom starts with empty storage
// so the component renders in the unauthenticated state by default.

import React from "react";
import { render, screen } from "@testing-library/react";
import SiteNav from "@/components/SiteNav";

describe("SiteNav — unauthenticated state", () => {
  beforeEach(() => {
    // Ensure localStorage is clean so getToken() returns null
    localStorage.clear();
  });

  it("renders the LexiMind Academy brand link", () => {
    render(<SiteNav />);
    // Brand link has aria-label "LexiMind Academy home"
    expect(
      screen.getByRole("link", { name: /leximind academy/i })
    ).toBeInTheDocument();
  });

  it("renders a main navigation landmark", () => {
    render(<SiteNav />);
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });

  it("renders Sign in and Get started links when not authenticated", () => {
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });

  it("does not render Logout button when not authenticated", () => {
    render(<SiteNav />);
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });
});
