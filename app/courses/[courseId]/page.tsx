import CourseDetailsClient from "@/components/CourseDetailsClient";

export const dynamic = "force-dynamic";

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  return (
    <main>
      <CourseDetailsClient courseId={params.courseId} />
    </main>
  );
}