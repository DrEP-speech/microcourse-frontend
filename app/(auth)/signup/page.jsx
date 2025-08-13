"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const metadata = {
  title: "Sign up | MicroCourse",
  description: "Create a new MicroCourse account."
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      // TODO: wire this to your real API route when ready
      // Example: POST /api/auth/signup
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Signup failed");
      }

      // On success, route users to login/dashboard as needed
      router.push("/login");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Create your account</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        Join MicroCourse to build, learn, and track your progress.
      </p>

      {errorMsg ? (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #ef4444",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={onChange}
            placeholder="Jane Doe"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            name="password"
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account?{" "}
        <a href="/login" style={{ textDecoration: "underline" }}>
          Log in
        </a>
      </p>
    </div>
  );
}