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

export default function ScoreboardPage() {
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch live game data with real-time updates
  useEffect(() => {
    const liveGameQuery = query(collection(db, 'liveGame'));

    const unsubscribe = onSnapshot(liveGameQuery, (snapshot) => {
      if (!snapshot.empty) {
        const gameData = snapshot.docs[0].data() as LiveGame;
        setLiveGame({
          ...gameData,
          id: snapshot.docs[0].id,
        });
        setLastRefresh(new Date());
      } else {
        setLiveGame(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh from AHL API every 30 seconds
  useEffect(() => {
    const refreshFromAHL = async () => {
      try {
        await fetch('/api/auto-update-live-game');
        console.log('Refreshed from AHL API');
      } catch (error) {
        console.error('Error refreshing from AHL:', error);
      }
    };

    // Initial fetch
    refreshFromAHL();

    // Set up interval for every 30 seconds
    const interval = setInterval(refreshFromAHL, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowGuests={true}>
        <div className="min-h-screen py-8 flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🏒</div>
            <div className="text-3xl font-black text-white">Loading Scoreboard...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!liveGame) {
    return (
      <ProtectedRoute allowGuests={true}>
        <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">🏒</div>
              <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
              }}>
                SCOREBOARD
              </h1>
              <p className="text-xl font-black text-white tracking-wide">LIVE TEXAS STARS GAME STATS</p>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-12 border-4 border-black text-center">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-3xl font-black text-gray-700 mb-4">NO GAME TODAY</h2>
              <p className="text-xl text-gray-600 font-bold mb-4">
                Check back on game day for live scores and real-time updates!
              </p>
              <p className="text-sm text-gray-500">
                Scores automatically update every 30 seconds from AHL.com
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isTexasHome = liveGame.homeTeam === 'Texas Stars';
  const texasScore = isTexasHome ? liveGame.homeScore : liveGame.awayScore;
  const opponentScore = isTexasHome ? liveGame.awayScore : liveGame.homeScore;
  const texasShots = isTexasHome ? liveGame.homeShotsOnGoal : liveGame.awayShotsOnGoal;
  const opponentShots = isTexasHome ? liveGame.awayShotsOnGoal : liveGame.homeShotsOnGoal;
  const opponentName = isTexasHome ? liveGame.awayTeam : liveGame.homeTeam;
  const isTexasWinning = texasScore > opponentScore;
  const isTied = texasScore === opponentScore;

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
              SCOREBOARD
            </h1>
            {liveGame.isLive && (
              <div className="inline-flex items-center space-x-3 bg-red-600 text-white px-8 py-4 rounded-full border-4 border-white shadow-2xl animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <span className="text-2xl font-black uppercase tracking-wider">LIVE</span>
              </div>
            )}
          </div>

          {/* Main Scoreboard */}
          <div className="bg-black rounded-lg shadow-2xl border-4 border-white mb-6 overflow-hidden">
            {/* Period and Clock */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-center border-b-4 border-white">
              <div className="text-4xl font-black text-white uppercase tracking-wider mb-2">
                {liveGame.period}
              </div>
              {liveGame.timeRemaining && liveGame.isLive && (
                <div className="text-6xl font-black text-yellow-300 tabular-nums tracking-tight">
                  {liveGame.timeRemaining}
                </div>
              )}
              {!liveGame.isLive && (
                <div className="text-3xl font-black text-gray-400 uppercase">
                  {liveGame.gameStatus}
                </div>
              )}
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-0 bg-black">
              {/* Texas Stars */}
              <div className={`p-8 text-center ${isTexasHome ? 'bg-green-700' : 'bg-gray-800'} border-r-4 border-white`}>
                <div className="text-sm font-black text-white uppercase mb-2 tracking-wider">
                  {isTexasHome ? 'HOME' : 'AWAY'}
                </div>
                <div className="text-3xl font-black text-white mb-4 uppercase leading-tight">
                  TEXAS STARS
                </div>
                <div className={`text-9xl font-black tabular-nums ${
                  isTexasWinning ? 'text-yellow-300' : isTied ? 'text-white' : 'text-gray-400'
                }`}>
                  {texasScore}
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="text-5xl font-black text-white">VS</div>
              </div>

              {/* Opponent */}
              <div className={`p-8 text-center ${!isTexasHome ? 'bg-gray-700' : 'bg-gray-800'} border-l-4 border-white`}>
                <div className="text-sm font-black text-white uppercase mb-2 tracking-wider">
                  {!isTexasHome ? 'HOME' : 'AWAY'}
                </div>
                <div className="text-3xl font-black text-white mb-4 uppercase leading-tight">
                  {opponentName}
                </div>
                <div className={`text-9xl font-black tabular-nums ${
                  !isTexasWinning && !isTied ? 'text-yellow-300' : isTied ? 'text-white' : 'text-gray-400'
                }`}>
                  {opponentScore}
                </div>
              </div>
            </div>

            {/* Shots on Goal */}
            <div className="grid grid-cols-3 gap-0 bg-white p-6 border-t-4 border-white">
              <div className="text-center">
                <div className="text-5xl font-black text-black tabular-nums">{texasShots}</div>
                <div className="text-sm font-black text-gray-600 uppercase mt-2 tracking-wider">Shots</div>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-2xl font-black text-gray-600 uppercase tracking-wider">
                  SHOTS ON GOAL
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-black tabular-nums">{opponentShots}</div>
                <div className="text-sm font-black text-gray-600 uppercase mt-2 tracking-wider">Shots</div>
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black">
              <h3 className="text-2xl font-black text-black uppercase mb-4 flex items-center gap-3">
                <span>📊</span>
                <span>Game Status</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Status:</span>
                  <span className={`text-lg font-black uppercase ${
                    liveGame.isLive ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {liveGame.gameStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Period:</span>
                  <span className="text-lg font-black text-black">{liveGame.period}</span>
                </div>
                {liveGame.timeRemaining && (
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Time:</span>
                    <span className="text-lg font-black text-black tabular-nums">{liveGame.timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Info Card */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black">
              <h3 className="text-2xl font-black text-black uppercase mb-4 flex items-center gap-3">
                <span>🔄</span>
                <span>Updates</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Source:</span>
                  <span className="text-lg font-black text-black">AHL.com</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Refresh:</span>
                  <span className="text-lg font-black text-black">Every 30 sec</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">Last Update:</span>
                  <span className="text-lg font-black text-black">
                    {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {liveGame.isLive && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <p className="text-sm text-gray-600 font-bold text-center">
                    ✅ Auto-updating from live AHL data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
