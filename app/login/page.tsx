import LoginClient from "@/components/LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main>
      <h1 className="h1" style={{ textAlign: "center", marginBottom: 6 }}>Welcome back</h1>
      <p className="muted" style={{ textAlign: "center", marginBottom: 24 }}>
        Sign in to pick up where you left off.
      </p>
      <LoginClient />
    </main>
  );
}