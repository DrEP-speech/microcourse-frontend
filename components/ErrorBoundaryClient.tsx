"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
};

export class ErrorBoundaryClient extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundaryClient]", error);
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 12 }}>
            {this.state.errorMessage ?? "Unexpected error."}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
