import CourseDetailsClient from "@/components/CourseDetailsClient";

export const dynamic = "force-dynamic";

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <CourseDetailsClient courseId={params.courseId} />
    </main>
  );
}