import LoginClient from "@/components/LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Login</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Your /api/courses route requires a token. Login stores it locally so the app can call protected routes.
      </p>
      <LoginClient />
    </main>
  );
}