'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestUpgradePrompt from '@/components/GuestUpgradePrompt';

export default function MenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, isGuest } = useAuth();
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

  const handleRestrictedClick = (e: React.MouseEvent) => {
    if (isGuest) {
      e.preventDefault();
      setIsMenuOpen(false);
      setShowUpgradeModal(true);
    }
  };

  const restrictedPages = ['/predictions', '/admin'];

  return (
    <div className="fixed top-4 left-4 z-50" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="px-10 py-5 bg-black text-white rounded-xl hover:bg-gray-800 font-black border-4 border-white text-3xl flex items-center gap-4 shadow-2xl"
      >
        ☰ MENU
      </button>
      {isMenuOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border-4 border-black rounded-lg shadow-2xl min-w-[320px] max-h-[80vh] overflow-y-auto">
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
            href="/schedule"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            📅 SCHEDULE
          </Link>
          <Link
            href="/standings"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🏆 STANDINGS
          </Link>
          <Link
            href="/roster"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            👥 ROSTER
          </Link>
          <Link
            href="/predictions"
            onClick={(e) => {
              if (isGuest) {
                handleRestrictedClick(e);
              } else {
                setIsMenuOpen(false);
              }
            }}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🎯 PREDICTIONS {isGuest && '🔒'}
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🏅 LEADERBOARD
          </Link>
          <Link
            href="/recaps"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            📝 RECAPS
          </Link>
          <Link
            href="/highlights"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🎥 HIGHLIGHTS
          </Link>
          <Link
            href="/head-to-head"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            ⚔️ H2H
          </Link>
          <Link
            href="/arena"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🏟️ ARENA
          </Link>
          <Link
            href="/tickets"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🎟️ TICKETS
          </Link>
          <Link
            href="/social"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            📱 SOCIAL
          </Link>
          <Link
            href="/trivia"
            onClick={() => setIsMenuOpen(false)}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🧠 TRIVIA
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
            onClick={(e) => {
              if (isGuest) {
                handleRestrictedClick(e);
              } else {
                setIsMenuOpen(false);
              }
            }}
            className="block px-8 py-5 hover:bg-gray-100 font-black text-black border-b-4 border-gray-200 text-2xl"
          >
            🔧 ADMIN {isGuest && '🔒'}
          </Link>
          {!isGuest ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-8 py-5 hover:bg-red-50 font-black text-red-600 text-2xl"
            >
              🚪 LOGOUT
            </button>
          ) : (
            <Link
              href="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block px-8 py-5 hover:bg-green-50 font-black text-green-600 text-2xl border-t-4 border-green-600"
            >
              ⭐ SIGN UP
            </Link>
          )}
        </div>
      )}

      {/* Upgrade Modal for Guests */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => setShowUpgradeModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full">
            <GuestUpgradePrompt />
          </div>
        </div>
      )}
    </div>
  );
}
