'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, where, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

interface ScheduleGame {
  id: string;
  date: any;
  opponent: string;
  opponentAbbr: string;
  isHome: boolean;
  location: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'final';
  starsScore?: number;
  opponentScore?: number;
  season: string;
}

interface Prediction {
  userId: string;
  gameId: string;
  predictedWinner: 'stars' | 'opponent';
  createdAt: any;
  gameStatus: string;
  awarded?: boolean;
}

interface UserStats {
  pucks: number;
  correctPredictions: number;
  totalPredictions: number;
}

export default function PredictionsPage() {
  const { user } = useAuth();
  const [upcomingGames, setUpcomingGames] = useState<ScheduleGame[]>([]);
  const [predictions, setPredictions] = useState<{[key: string]: Prediction}>({});
  const [userStats, setUserStats] = useState<UserStats>({ pucks: 0, correctPredictions: 0, totalPredictions: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({});

  // Fetch upcoming games
  useEffect(() => {
    const gamesQuery = query(
      collection(db, 'schedule'),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const gamesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ScheduleGame))
        .filter(game => {
          // Only show games that haven't started yet
          const gameDate = game.date?.toDate ? game.date.toDate() : new Date(game.date);
          return gameDate > new Date();
        })
        .slice(0, 10); // Show next 10 games

      setUpcomingGames(gamesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user predictions
  useEffect(() => {
    if (!user) return;

    const predictionsQuery = query(
      collection(db, 'predictions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(predictionsQuery, (snapshot) => {
      const predictionsData: {[key: string]: Prediction} = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Prediction;
        predictionsData[data.gameId] = data;
      });
      setPredictions(predictionsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch user stats
  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      const userStatsRef = doc(db, 'userStats', user.uid);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        setUserStats(userStatsDoc.data() as UserStats);
      } else {
        // Initialize user stats
        await setDoc(userStatsRef, {
          pucks: 0,
          correctPredictions: 0,
          totalPredictions: 0
        });
      }
    };

    fetchUserStats();
  }, [user]);

  const handlePrediction = async (gameId: string, predictedWinner: 'stars' | 'opponent') => {
    if (!user) return;

    setSubmitting({ ...submitting, [gameId]: true });

    try {
      const predictionId = `${user.uid}_${gameId}`;
      const predictionRef = doc(db, 'predictions', predictionId);

      await setDoc(predictionRef, {
        userId: user.uid,
        gameId,
        predictedWinner,
        createdAt: new Date(),
        gameStatus: 'scheduled',
        awarded: false
      });

      // Update user stats - increment total predictions
      const userStatsRef = doc(db, 'userStats', user.uid);
      await updateDoc(userStatsRef, {
        totalPredictions: increment(1)
      });

    } catch (error) {
      console.error('Error submitting prediction:', error);
    } finally {
      setSubmitting({ ...submitting, [gameId]: false });
    }
  };

  const formatGameDate = (date: any) => {
    const gameDate = date?.toDate ? date.toDate() : new Date(date);
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="text-white text-xl">Loading predictions...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">🎯⭐</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            GAME PREDICTIONS
          </h1>
          <p className="text-xl font-black text-white tracking-wide">PICK THE WINNERS, EARN PUCKS!</p>
        </div>

        {/* User Stats */}
        <div className="max-w-4xl mx-auto mb-6 px-4">
          <div className="bg-black rounded-lg shadow-xl p-6 border-4 border-white">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-5xl mb-2">🏒</div>
                <div className="text-4xl font-black text-white">{userStats.pucks}</div>
                <div className="text-sm font-bold text-green-400 uppercase">Pucks</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">✅</div>
                <div className="text-4xl font-black text-white">{userStats.correctPredictions}</div>
                <div className="text-sm font-bold text-green-400 uppercase">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">📊</div>
                <div className="text-4xl font-black text-white">{userStats.totalPredictions}</div>
                <div className="text-sm font-bold text-green-400 uppercase">Total</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">🎯</div>
                <div className="text-4xl font-black text-white">
                  {userStats.totalPredictions > 0
                    ? Math.round((userStats.correctPredictions / userStats.totalPredictions) * 100)
                    : 0}%
                </div>
                <div className="text-sm font-bold text-green-400 uppercase">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black mb-4">
            <h2 className="text-3xl font-black text-black mb-4 uppercase flex items-center">
              <span className="mr-3">🏒</span>
              Upcoming Games
            </h2>
            <p className="text-gray-700 font-semibold mb-2">
              Pick the winning team for each game. Earn 5 pucks for each correct prediction! 🎯
            </p>
          </div>

          {upcomingGames.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border-4 border-black">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-gray-600 font-bold text-lg">No upcoming games available for predictions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingGames.map((game) => {
                const prediction = predictions[game.id];
                const hasPredicted = !!prediction;

                return (
                  <div key={game.id} className="bg-white rounded-lg shadow-xl p-6 border-4 border-black">
                    <div className="mb-4 text-center">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                        {formatGameDate(game.date)}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">{game.location}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center mb-4">
                      {/* Texas Stars */}
                      <button
                        onClick={() => !hasPredicted && handlePrediction(game.id, 'stars')}
                        disabled={hasPredicted || submitting[game.id]}
                        className={`p-6 rounded-lg border-4 transition-all ${
                          prediction?.predictedWinner === 'stars'
                            ? 'bg-green-600 border-green-800 text-white scale-105'
                            : hasPredicted
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-black hover:bg-green-50 hover:border-green-600 cursor-pointer'
                        }`}
                      >
                        <div className="text-4xl mb-2">⭐</div>
                        <div className="font-black text-xl uppercase">
                          {game.isHome ? 'Stars (H)' : 'Stars (A)'}
                        </div>
                        {prediction?.predictedWinner === 'stars' && (
                          <div className="text-xs mt-2 font-bold">✅ YOUR PICK</div>
                        )}
                      </button>

                      {/* VS */}
                      <div className="text-center">
                        <div className="text-3xl font-black text-gray-400">VS</div>
                      </div>

                      {/* Opponent */}
                      <button
                        onClick={() => !hasPredicted && handlePrediction(game.id, 'opponent')}
                        disabled={hasPredicted || submitting[game.id]}
                        className={`p-6 rounded-lg border-4 transition-all ${
                          prediction?.predictedWinner === 'opponent'
                            ? 'bg-red-600 border-red-800 text-white scale-105'
                            : hasPredicted
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-black hover:bg-red-50 hover:border-red-600 cursor-pointer'
                        }`}
                      >
                        <div className="text-4xl mb-2">🏒</div>
                        <div className="font-black text-xl uppercase">
                          {game.opponent} {!game.isHome ? '(H)' : '(A)'}
                        </div>
                        {prediction?.predictedWinner === 'opponent' && (
                          <div className="text-xs mt-2 font-bold">✅ YOUR PICK</div>
                        )}
                      </button>
                    </div>

                    {hasPredicted && (
                      <div className="text-center mt-4 p-3 bg-green-100 rounded-lg border-2 border-green-600">
                        <p className="text-green-800 font-black text-sm uppercase">
                          🎯 Prediction Locked! Good luck!
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-black rounded-lg shadow-xl p-6 border-4 border-white">
            <h3 className="text-2xl font-black text-white mb-3 uppercase">How It Works</h3>
            <ul className="space-y-2 text-white font-semibold">
              <li className="flex items-start">
                <span className="text-2xl mr-3">1️⃣</span>
                <span>Select the team you think will win each upcoming game</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">2️⃣</span>
                <span>Once locked, you cannot change your prediction</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">3️⃣</span>
                <span>Earn 5 pucks for each correct prediction! 🏒</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">4️⃣</span>
                <span>Compete with other fans on the leaderboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
