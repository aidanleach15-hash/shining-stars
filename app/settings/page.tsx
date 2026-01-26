'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { user, logout, updateUsername } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('');

  const handleDeleteAccount = async () => {
    // For now, just logout - you can add actual account deletion later
    await logout();
    router.push('/');
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setUsernameLoading(true);
    setUsernameMessage('');
    try {
      await updateUsername(username);
      setUsernameMessage('Username updated successfully! ⭐');
      setUsername('');
      setTimeout(() => setUsernameMessage(''), 3000);
    } catch (error: any) {
      setUsernameMessage('Error updating username: ' + error.message);
    } finally {
      setUsernameLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">⚙️</div>
            <h1 className="text-5xl font-black text-black mb-2 tracking-wider" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              Settings
            </h1>
            <p className="text-lg text-white font-bold">Manage your account</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-gray-600">USERNAME</p>
                <p className="text-lg font-bold text-black">
                  {user?.displayName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">EMAIL</p>
                <p className="text-lg font-bold text-black">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">USER ID</p>
                <p className="text-sm font-mono text-gray-700">{user?.uid}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">ACCOUNT CREATED</p>
                <p className="text-sm text-gray-700">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4">Change Username</h2>
            <form onSubmit={handleUpdateUsername}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                  NEW USERNAME
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your new username"
                  className="w-full px-4 py-2 border-3 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-600 text-gray-900 font-medium"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">This will be shown on all your posts (max 20 characters)</p>
              </div>
              {usernameMessage && (
                <div className={`mb-4 p-3 rounded-lg ${usernameMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-bold`}>
                  {usernameMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={usernameLoading || !username.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {usernameLoading ? 'Updating...' : 'Update Username'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-red-500">
            <h2 className="text-2xl font-black text-red-600 mb-4">Danger Zone</h2>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
              >
                Delete Account
              </button>
            ) : (
              <div>
                <p className="text-black mb-4 font-semibold">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="space-x-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                  >
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
