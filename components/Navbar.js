'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();

  function onLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className='nav'>
      <div className='row'>
        <Link className='brand' href='/'>
          <span style={{ fontSize: 18 }}>MicroCourse</span>
          <span className='badge'>Sellable Build</span>
        </Link>

        <div className='row'>
          <Link className='badge' href='/courses'>Catalog</Link>
          {isAuthed && <Link className='badge' href='/dashboard'>Dashboard</Link>}
        </div>
      </div>

      <div className='row'>
        <span className='small' style={{ opacity: 0.9 }}>
          {path}
        </span>

        {!isAuthed ? (
          <div className='row'>
            <Link className='btn' href='/login'>Login</Link>
            <Link className='btn primary' href='/register'>Register</Link>
          </div>
        ) : (
          <div className='row'>
            <span className='badge'>
              {user?.name || 'User'} · {user?.role || 'student'}
            </span>
            <button className='btn danger' onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
