'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
er