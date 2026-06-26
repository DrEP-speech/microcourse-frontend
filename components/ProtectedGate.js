'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';

export default function ProtectedGate({ children }) {
  const { ready, isAuthed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthed) router.replace('/login');
  }, [ready, isAuthed, router]);

  if (!ready) return <div className='card'><p className='p'>Loading session…</p></div>;
  if (!isAuthed) return <div className='card'><p className='p'>Redirecting…</p></div>;

  return children;
}
