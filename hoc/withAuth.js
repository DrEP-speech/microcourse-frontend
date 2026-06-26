'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (options.role && user.role !== options.role) {
        router.push('/unauthorized');
        return;
      }
    }, [user]);

    if (!user) {
      return <div className="text-center p-6">🔐 Verifying access...</div>;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
