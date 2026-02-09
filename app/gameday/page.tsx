'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface LiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  homeShotsOnGoal: number;
  awayShotsOnGoal: number;
  isLive: boolean;
  gameStatus: string;
  lastUpdated?: string;
}

export default function GameDayPage() {
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live game data
  useEffect(() => {
    const liveGameQuery = query(collection(db, 'liveGame'));

    const unsubscribe = onSnapshot(liveGameQuery, (snapshot) => {
      if (!snapshot.empty) {
        const gameData = snapshot.docs[0].data() as LiveGame;
        setLiveGame({
          ...gameData,
          id: snapshot.docs[0].id,
        });
      } else {
        setLiveGame(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // The onSnapshot will automatically update when data changes
      console.log('Auto-refresh tick');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowGuests={true}>
        <div className="min-h-screen py-8 flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="text-4xl font-black text-white">Loading Game Day...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!liveGame) {
    return (
      <ProtectedRoute allowGuests={true}>
        <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">🏒</div>
              <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
              }}>
                GAME DAY
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-12 border-4 border-black text-center">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-3xl font-black text-gray-700 mb-4">NO GAME TODAY</h2>
              <p className="text-xl text-gray-600 font-bold">
                Check back on game day for live scores and updates!
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isTexasWinning = liveGame.homeTeam === 'Texas Stars'
    ? liveGame.homeScore > liveGame.awayScore
    : liveGame.awayScore > liveGame.homeScore;

  const isTexasHome = liveGame.homeTeam === 'Texas Stars';
  const texasScore = isTexasHome ? liveGame.homeScore : liveGame.awayScore;
  const opponentScore = isTexasHome ? liveGame.awayScore : liveGame.homeScore;
  const texasShots = isTexasHome ? liveGame.homeShotsOnGoal : liveGame.awayShotsOnGoal;
  const opponentShots = isTexasHome ? liveGame.awayShotsOnGoal : liveGame.homeShotsOnGoal;
  const opponentName = isTexasHome ? liveGame.awayTeam : liveGame.homeTeam;

  return (
    <ProtectedRoute allowGuests={true}>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-2">🏒</div>
            <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              GAME DAY
            </h1>
            {liveGame.isLive && (
              <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-full border-4 border-white shadow-xl animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-xl font-black uppercase tracking-wider">LIVE</span>
              </div>
            )}
          </div>

          {/* Main Score Card */}
          <div className="bg-black rounded-lg shadow-2xl p-8 border-4 border-white mb-6">
            {/* Period and Time */}
            <div className="text-center mb-6">
              <div className="text-3xl font-black text-white mb-2">{liveGame.period}</div>
              {liveGame.timeRemaining && (
                <div className="text-5xl font-black text-green-400">{liveGame.timeRemaining}</div>
              )}
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-8 items-center mb-8">
              {/* Texas Stars */}
              <div className={`text-center p-6 rounded-lg ${isTexasHome ? 'bg-green-600' : 'bg-gray-700'}`}>
                <div className="text-sm font-bold text-white uppercase mb-2">
                  {isTexasHome ? 'Home' : 'Away'}
                </div>
                <div className="text-2xl font-black text-white mb-3">TEXAS STARS</div>
                <div className={`text-8xl font-black ${isTexasWinning ? 'text-yellow-300' : 'text-white'}`}>
                  {texasScore}
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-4xl font-black text-white">VS</div>
              </div>

              {/* Opponent */}
              <div className={`text-center p-6 rounded-lg ${!isTexasHome ? 'bg-gray-600' : 'bg-gray-700'}`}>
                <div className="text-sm font-bold text-white uppercase mb-2">
                  {!isTexasHome ? 'Home' : 'Away'}
                </div>
                <div className="text-2xl font-black text-white mb-3">{opponentName.toUpperCase()}</div>
                <div className={`text-8xl font-black ${!isTexasWinning ? 'text-yellow-300' : 'text-white'}`}>
                  {opponentScore}
                </div>
              </div>
            </div>

            {/* Shots on Goal */}
            <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl font-black text-black">{texasShots}</div>
                <div className="text-sm font-bold text-gray-600 uppercase mt-1">Texas SOG</div>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-lg font-black text-gray-600 uppercase">Shots on Goal</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-black">{opponentShots}</div>
                <div className="text-sm font-bold text-gray-600 uppercase mt-1">Opponent SOG</div>
              </div>
            </div>
          </div>

          {/* Game Status */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black text-center">
            <div className="text-xl font-black text-gray-700 uppercase">
              {liveGame.gameStatus}
            </div>
            {liveGame.isLive && (
              <p className="text-sm text-gray-600 font-bold mt-2">
                Updates automatically every 10 seconds
              </p>
            )}
            {liveGame.lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date(liveGame.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
