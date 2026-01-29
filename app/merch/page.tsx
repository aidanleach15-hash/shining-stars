'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
  category: string;
}

export default function MerchPage() {
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Auto-fetch merch data on load
  useEffect(() => {
    const fetchMerch = async () => {
      try {
        await fetch('/api/fetch-merch');
      } catch (error) {
        console.error('Error fetching merch:', error);
      }
    };

    fetchMerch();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'merchandise'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MerchItem));
      setMerchItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['all', ...Array.from(new Set(merchItems.map(item => item.category)))];
  const filteredItems = filter === 'all'
    ? merchItems
    : merchItems.filter(item => item.category === filter);

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
            <div className="text-5xl sm:text-7xl mb-2">🛍️⭐</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              MERCH SHOP
            </h1>
            <p className="text-lg sm:text-xl font-black text-white tracking-wide">OFFICIAL TEXAS STARS GEAR</p>
          </div>

          {/* Category Filter */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 sm:border-4 border-black mb-4 sm:mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
              <span className="font-black text-black uppercase text-xs sm:text-sm">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    filter === cat
                      ? 'bg-green-600 text-white border-2 border-black'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl sm:text-2xl font-bold">Loading merchandise...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border-2 sm:border-4 border-black text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛍️</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 uppercase">No Items Found</h2>
              <p className="text-base sm:text-lg text-gray-600 font-bold">
                Check back soon for Texas Stars merchandise!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-xl border-2 sm:border-4 border-black overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  {/* Product Image */}
                  <div className="relative h-48 sm:h-64 bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl sm:text-8xl">⭐</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full font-black text-xs sm:text-sm">
                      {item.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-black text-black mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl sm:text-2xl font-black text-green-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-black text-xs sm:text-sm uppercase text-center transition-all"
                    >
                      🛒 Buy Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Official Store Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <a
              href="https://texasstarsshop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-700 rounded-xl hover:bg-gray-100 font-black border-2 sm:border-4 border-black text-base sm:text-xl shadow-2xl transform hover:scale-105 transition-all"
            >
              🏒 VISIT OFFICIAL STORE
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
