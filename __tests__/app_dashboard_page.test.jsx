import React from "react";
import { render, screen } from "@testing-library/react";

function requireFirstExisting(paths) {
  const errors = [];
  for (const p of paths) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const mod = require(p);
      return mod?.default || mod;
    } catch (e) {
      errors.push(`${p} -> ${e.message}`);
    }
  }
  throw new Error(["DashboardClient not found. Tried:", ...errors].join("\n"));
}

describe("Dashboard", () => {
  it("renders a Dashboard heading", () => {
    const DashboardClient = requireFirstExisting([
      "../src/app/dashboard/DashboardClient",
      "../app/dashboard/DashboardClient",
      "../src/app/dashboard/DashboardClient.jsx",
      "../app/dashboard/DashboardClient.jsx",
    ]);

    render(<DashboardClient />);
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    const DashboardClient = requireFirstExisting([
      "../src/app/dashboard/DashboardClient",
      "../app/dashboard/DashboardClient",
      "../src/app/dashboard/DashboardClient.jsx",
      "../app/dashboard/DashboardClient.jsx",
    ]);

    render(<DashboardClient />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^dashboard$/i })).toBeInTheDocument();
  });
});
