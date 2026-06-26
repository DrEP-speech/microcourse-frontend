import CoursesClient from "@/components/CoursesClient";

export const dynamic = "force-dynamic";

export default function CoursesPage() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Courses</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Pulled from the backend API. If this is empty, it&apos;s not a “frontend problem” — it&apos;s data/routes.
      </p>
      <CoursesClient />
    </main>
  );
}