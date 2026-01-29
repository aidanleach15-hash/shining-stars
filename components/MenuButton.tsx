'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <div className="fixed top-4 left-4 z-50" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="px-10 py-5 bg-black text-white rounded-xl hover:bg-gray-800 font-black border-4 border-white text-3xl flex items-center gap-4 shadow-2xl"
      >
        ☰ MENU
      </button>
      {isMenuOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border-4 border-black rounded-lg shadow-2xl min-w-[320px]">
          <Link
            href="/feed"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            ⭐ FEED
          </Link>
          <Link
            href="/news"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            📰 NEWS
          </Link>
          <Link
            href="/stats"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            📊 STATS
          </Link>
          <Link
            href="/gameday"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🏒 GAME DAY
          </Link>
          <Link
            href="/live-chat"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            💬 LIVE CHAT
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            ⚙️ SETTINGS
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🔧 ADMIN
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-8 py-5 hover:bg-red-50 font-black text-red-600 text-2xl"
          >
            🚪 LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}
