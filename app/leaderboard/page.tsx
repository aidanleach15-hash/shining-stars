'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

interface LeaderboardEntry {
  userId: string;
  username: string;
  pucks: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardQuery = query(
      collection(db, 'userStats'),
      orderBy('pucks', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(leaderboardQuery, async (snapshot) => {
      const leaderboardData: LeaderboardEntry[] = [];

      for (const docSnap of snapshot.docs) {
        const stats = docSnap.data();
        const userId = docSnap.id;

        // Get user info from auth
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        const accuracy = stats.totalPredictions > 0
          ? (stats.correctPredictions / stats.totalPredictions) * 100
          : 0;

        leaderboardData.push({
          userId,
          username: userData?.displayName || userData?.email?.split('@')[0] || 'Stars Fan',
          pucks: stats.pucks || 0,
          correctPredictions: stats.correctPredictions || 0,
          totalPredictions: stats.totalPredictions || 0,
          accuracy
        });
      }

      setLeaderboard(leaderboardData);

      // Find user's rank
      if (user) {
        const rank = leaderboardData.findIndex(entry => entry.userId === user.uid);
        if (rank !== -1) {
          setUserRank(rank + 1);
          setUserStats(leaderboardData[rank]);
        } else {
          // User not in top 50, fetch their stats
          const userStatsRef = doc(db, 'userStats', user.uid);
          const userStatsDoc = await getDoc(userStatsRef);
          if (userStatsDoc.exists()) {
            const stats = userStatsDoc.data();
            const accuracy = stats.totalPredictions > 0
              ? (stats.correctPredictions / stats.totalPredictions) * 100
              : 0;

            setUserStats({
              userId: user.uid,
              username: user.displayName || user.email?.split('@')[0] || 'You',
              pucks: stats.pucks || 0,
              correctPredictions: stats.correctPredictions || 0,
              totalPredictions: stats.totalPredictions || 0,
              accuracy
            });
          }
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="text-white text-xl">Loading leaderboard...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">🏆⭐</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            LEADERBOARD
          </h1>
          <p className="text-xl font-black text-white tracking-wide">TOP PREDICTION MASTERS!</p>
        </div>

        {/* Your Stats */}
        {userStats && (
          <div className="max-w-4xl mx-auto mb-6 px-4">
            <div className="bg-black rounded-lg shadow-xl p-6 border-4 border-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-green-400 uppercase mb-1">Your Stats</p>
                  <p className="text-2xl font-black text-white">{userStats.username}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{userStats.pucks}</div>
                    <div className="text-xs font-bold text-green-400">PUCKS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{Math.round(userStats.accuracy)}%</div>
                    <div className="text-xs font-bold text-green-400">ACCURACY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{userRank ? `#${userRank}` : 'N/A'}</div>
                    <div className="text-xs font-bold text-green-400">RANK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl border-4 border-black overflow-hidden">
            <div className="bg-black p-6 border-b-4 border-white">
              <h2 className="text-3xl font-black text-white text-center uppercase">
                🏒 Top 50 Fans 🏒
              </h2>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-gray-600 font-bold text-lg">
                  No predictions yet. Be the first to make predictions!
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user?.uid === entry.userId;

                  return (
                    <div
                      key={entry.userId}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        isCurrentUser ? 'bg-green-50 border-l-4 border-green-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`text-2xl font-black ${
                            rank <= 3 ? 'text-3xl' : 'text-gray-600'
                          } min-w-[60px] text-center`}>
                            {getMedalEmoji(rank)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-black text-black">
                                {entry.username}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600 font-semibold">
                              <span>{entry.correctPredictions}/{entry.totalPredictions} Correct</span>
                              <span>•</span>
                              <span>{Math.round(entry.accuracy)}% Accuracy</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-green-600">
                            {entry.pucks}
                          </div>
                          <div className="text-xs font-bold text-gray-500 uppercase">Pucks</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-black rounded-lg shadow-xl p-6 border-4 border-white">
            <h3 className="text-2xl font-black text-white mb-3 uppercase text-center">
              🏒 How to Climb the Leaderboard 🏒
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white font-semibold text-center">
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm">Make accurate predictions</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm">Earn 5 pucks per correct pick</p>
              </div>
              <div>
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-sm">Compete with Stars fans!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
