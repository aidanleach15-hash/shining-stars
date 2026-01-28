'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show navbar on landing, login, or signup pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const navLinks = [
    { href: '/feed', label: '🏠 Feed', icon: '🏠' },
    { href: '/gameday', label: '🏒 Game Day', icon: '🏒' },
    { href: '/stats', label: '📊 Stats', icon: '📊' },
  ];

  // Add admin link only for admin users
  if (user?.email === 'aidanleach15@gmail.com') {
    navLinks.push({ href: '/admin', label: '⚙️ Admin', icon: '⚙️' });
  }

  return (
    <nav className="w-full bg-black border-b-4 border-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl">⭐</span>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">STARS HUB</h1>
              <p className="text-xs text-green-400 font-bold">FAN ZONE</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  pathname === link.href
                    ? 'bg-green-600 text-white border-2 border-white'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden text-xl">{link.icon}</span>
              </Link>
            ))}

            {/* Sign Out Button */}
            {user && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-all"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">🚪</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
