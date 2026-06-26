import Link from "next/link";

export default function CourseCard({ course }) {
  if (!course) return null;

  const id = course._id || course.id || course.courseId || "";
  const href = `/courses/${id}`;

  return (
    <div className="card span6">
      <h3 className="h2">{course.title || "Untitled Course"}</h3>
      <p className="p">{course.description || "No description provided."}</p>

      <div className="hr" />

      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge">Status: {course.status || "draft"}</span>
        <Link className="btn primary" href={href}>
          View
        </Link>
      </div>
    </div>
  );
}