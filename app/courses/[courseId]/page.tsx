import CourseDetailsClient from "@/components/CourseDetailsClient";

export const dynamic = "force-dynamic";

// Next.js 15+: params is a Promise in server components — must be awaited.
export default async function CourseDetailsPage(props: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await props.params;
  return (
    <main>
      <CourseDetailsClient courseId={courseId} />
    </main>
  );
}
