'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/courses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setCourses);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push('/admin/courses/new')}
      >
        + Create New Course
      </button>
      <ul className="space-y-4">
        {courses.map((c) => (
          <li key={c._id} className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p>{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
