'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#007A33'}}>
      {/* Header Bar */}
      <header className="w-full bg-black border-b-4 border-white shadow-lg" style={{height: '80px'}}>
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto" style={{paddingLeft: '24px', paddingRight: '24px'}}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">⭐</span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">STARS HUB</h1>
              <p className="text-xs text-green-400 font-bold">OFFICIAL FAN ZONE</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 font-bold text-white hover:text-green-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-green-600 text-white font-bold hover:bg-green-700 transition-all rounded-lg shadow-md"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex items-center justify-center px-4 py-16" style={{minHeight: 'calc(100vh - 80px)'}}>
        <div className="text-center max-w-5xl">
          <div className="flex justify-center gap-6 mb-8">
            <span className="text-9xl animate-pulse">⭐</span>
            <span className="text-9xl">🏒</span>
            <span className="text-9xl animate-pulse">⭐</span>
          </div>

          <h1 className="text-8xl md:text-9xl font-black text-black mb-8 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: '-4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff, 4px 4px 0 #fff'
          }}>
            GO STARS!
          </h1>

          <div className="bg-black/90 backdrop-blur-sm p-10 rounded-2xl border-4 border-white shadow-2xl mb-10">
            <p className="text-4xl text-white font-black mb-4">
              THE #1 TEXAS STARS FAN COMMUNITY
            </p>
            <p className="text-2xl text-green-400 font-bold mb-4">
              Connect with thousands of Stars fans worldwide!
            </p>
            <p className="text-xl text-gray-200 leading-relaxed">
              Share game reactions • Celebrate victories • Talk hockey 24/7
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              href="/signup"
              className="px-14 py-5 bg-white text-green-700 rounded-xl hover:bg-gray-100 font-black border-4 border-black text-2xl shadow-2xl transform hover:scale-105 transition-all"
            >
              JOIN THE FANS
            </Link>
            <Link
              href="/login"
              className="px-14 py-5 bg-black text-white rounded-xl hover:bg-gray-900 font-black border-4 border-white text-2xl shadow-2xl transform hover:scale-105 transition-all"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
