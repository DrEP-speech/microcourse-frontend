import CoursesClient from "@/components/CoursesClient";

export const dynamic = "force-dynamic";

export default function CoursesPage() {
  return (
    <main>
      <h1 className="h1">Course catalog</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Pick a course to see its lessons and quizzes.
      </p>
      <CoursesClient />
    </main>
  );
}