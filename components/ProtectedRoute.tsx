'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import MenuButton from '@/components/MenuButton';
import GuestUpgradePrompt from '@/components/GuestUpgradePrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuests?: boolean;
}

export default function ProtectedRoute({ children, allowGuests = false }: ProtectedRouteProps) {
  const { user, loading, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.push('/login');
    }
  }, [user, loading, isGuest, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If authenticated user, allow access
  if (user) {
    return (
      <>
        <MenuButton />
        {children}
      </>
    );
  }

  // If guest and guests are allowed, show content
  if (isGuest && allowGuests) {
    return (
      <>
        <MenuButton />
        {children}
      </>
    );
  }

  // If guest but guests not allowed, show upgrade prompt
  if (isGuest && !allowGuests) {
    return (
      <>
        <MenuButton />
        <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-2xl w-full">
            <GuestUpgradePrompt />
          </div>
        </div>
      </>
    );
  }

  // Not authenticated and not guest - redirect handled by useEffect
  return null;
}
