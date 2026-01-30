'use client';

import Link from 'next/link';

interface GuestUpgradePromptProps {
  inline?: boolean;
}

export default function GuestUpgradePrompt({ inline = false }: GuestUpgradePromptProps) {
  if (inline) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-3 border-green-600 rounded-lg p-4 text-center">
        <p className="text-gray-800 font-bold mb-3">
          Sign up to unlock this feature!
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/signup"
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 border-2 border-green-600 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-black text-center">
      <div className="text-6xl mb-4">🔒⭐</div>
      <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-wide">
        Sign Up to Unlock!
      </h2>
      <p className="text-gray-700 font-semibold text-lg mb-6">
        Join the Stars community to access premium features:
      </p>
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">📝</span>
          <p className="text-gray-800 font-bold">Post updates and share your thoughts</p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">💬</span>
          <p className="text-gray-800 font-bold">Join live game chat</p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">🎯</span>
          <p className="text-gray-800 font-bold">Make game predictions</p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">⭐</span>
          <p className="text-gray-800 font-bold">Like and comment on posts</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="px-8 py-4 bg-green-600 text-white font-black rounded-lg hover:bg-green-700 transition-all text-lg uppercase tracking-wider shadow-lg"
        >
          Create Account
        </Link>
        <Link
          href="/login"
          className="px-8 py-4 bg-white text-green-600 font-black rounded-lg hover:bg-gray-100 border-3 border-green-600 transition-all text-lg uppercase tracking-wider"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
