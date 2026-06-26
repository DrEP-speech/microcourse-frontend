import Link from "next/link";

export default function CourseCard({ course }) {
  if (!course) return null;

  const id = course._id || course.id;
  const href = id ? `/courses/${id}` : "/courses";

  return (
    <div className="card span6" data-testid="course-card">
      <h3 className="h2">{course.title || "Untitled Course"}</h3>
      <p className="p">{course.description || "No description provided."}</p>

      <div className="hr" />

      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge">
          Status: {course.status || "draft"}
        </span>

        <Link className="btn primary" href={href} data-testid="course-open" data-testid="course-view-link">
          View
        </Link>
      </div>
    </div>
  );
}