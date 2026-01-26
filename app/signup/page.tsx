'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      router.push('/feed');
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#007A33'}}>
      {/* Header Bar */}
      <header className="w-full bg-black border-b-4 border-white shadow-lg" style={{height: '80px'}}>
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto" style={{paddingLeft: '24px', paddingRight: '24px'}}>
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-4xl">⭐</span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">STARS HUB</h1>
              <p className="text-xs text-green-400 font-bold">OFFICIAL FAN ZONE</p>
            </div>
          </Link>

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

      {/* Signup Form */}
      <div className="flex items-center justify-center px-4 py-12" style={{minHeight: 'calc(100vh - 80px)'}}>
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full border-4 border-black">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-4">
              <span className="text-5xl">⭐</span>
              <span className="text-5xl">🏒</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Join the Family!</h2>
            <p className="text-gray-600 font-semibold">Become part of the Stars community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                placeholder="Re-enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-black text-lg shadow-lg transition-all transform hover:scale-105"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t-2 border-gray-200">
            <p className="text-gray-700 font-semibold mb-2">
              Already have an account?
            </p>
            <Link href="/login" className="text-green-700 font-black hover:text-green-800 text-lg hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
