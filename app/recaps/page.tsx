'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import MenuButton from '@/components/MenuButton';

export default function RecapsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <MenuButton />

        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border-4 border-white shadow-2xl p-8 mb-6">
              <h1 className="text-5xl font-black text-black mb-4 text-center">
                📝 RECAPS
              </h1>
              <p className="text-center text-gray-600 text-xl font-bold">
                Read detailed recaps of recent Texas Stars games!
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl border-4 border-white shadow-2xl p-8 text-center">
              <p className="text-3xl font-black text-white mb-4">
                COMING SOON!
              </p>
              <p className="text-xl text-gray-300">
                Game recaps feature is under development.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
