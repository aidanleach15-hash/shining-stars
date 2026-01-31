'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Headline {
  id: string;
  title: string;
  summary: string;
  link?: string;
  createdAt: any;
}

export default function NewsPage() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);

  // Auto-update betting odds on load (silently, don't block page)
  useEffect(() => {
    const updateOdds = async () => {
      try {
        const response = await fetch('/api/update-betting-odds');
        if (!response.ok) {
          console.warn('Betting odds update failed, using defaults');
        }
      } catch (error) {
        console.warn('Error updating betting odds, using defaults:', error);
      }
    };

    updateOdds();
  }, []);

  // Fetch headlines
  useEffect(() => {
    const q = query(
      collection(db, 'headlines'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const headlinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Headline));
      setHeadlines(headlinesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">🏒⭐</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            STARS NEWS
          </h1>
          <p className="text-xl font-black text-white tracking-wide">STAY UP TO DATE WITH THE STARS</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Headlines Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-4xl">📰</span>
              <h2 className="text-3xl font-black text-black uppercase tracking-wide">
                LATEST HEADLINES
              </h2>
            </div>

            {headlines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 font-bold text-lg">No headlines available</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for the latest news! ⭐</p>
              </div>
            ) : (
              <div className="space-y-4">
                {headlines.map((headline) => (
                  <div
                    key={headline.id}
                    className="bg-gray-50 rounded-lg p-5 border-3 border-gray-300 hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">⭐</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">
                          {headline.title}
                        </h3>
                        <p className="text-gray-700 font-medium leading-relaxed mb-3">
                          {headline.summary}
                        </p>
                        {headline.link && (
                          <a
                            href={headline.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-bold text-sm uppercase transition-colors"
                          >
                            <span>Read More</span>
                            <span>→</span>
                          </a>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {headline.createdAt?.toDate ? new Date(headline.createdAt.toDate()).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
