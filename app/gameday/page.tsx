'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
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
}

interface Penalty {
  id: string;
  team: string;
  player: string;
  infraction: string;
  minutes: number;
  period: string;
  timeOfPenalty: string;
  timestamp: any;
}

export default function GameDayPage() {
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [penalties, setPenalties] = useState<Penalty[]>([]);

  // Auto-fetch live game data every 30 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        await fetch('/api/auto-update-live-game');
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    // Fetch immediately on load
    fetchLiveData();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'liveGame'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as LiveGame;
        setLiveGame(gameData);
      } else {
        setLiveGame(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'penalties'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const penaltiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Penalty));
      setPenalties(penaltiesData);
    });

    return () => unsubscribe();
  }, []);

  if (!liveGame) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
              <div className="text-5xl sm:text-7xl mb-2">🏒📺</div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
              }}>
                GAME DAY
              </h1>
              <p className="text-lg sm:text-xl font-black text-white tracking-wide">LIVE GAME CENTER</p>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl border-2 sm:border-4 border-black text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏒</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 uppercase">No Live Game</h2>
              <p className="text-base sm:text-lg text-gray-600 font-bold mb-2">
                There is no game in progress right now.
              </p>
              <p className="text-sm text-gray-500">
                Check back on game day for live updates!
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
            <div className="text-5xl sm:text-7xl mb-2">🏒📺</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              GAME DAY
            </h1>
            <p className="text-lg sm:text-xl font-black text-white tracking-wide">LIVE GAME CENTER</p>
          </div>

          {/* Live Indicator */}
          {liveGame.isLive && (
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-full font-black uppercase text-xs sm:text-sm flex items-center gap-2 animate-pulse border-2 sm:border-4 border-white shadow-lg">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></span>
                LIVE NOW
              </div>
            </div>
          )}

          {/* Scoreboard */}
          <div className="bg-black p-3 sm:p-6 rounded-lg shadow-xl border-2 sm:border-4 border-white mb-4 sm:mb-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
              {/* Away Team */}
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase mb-1 sm:mb-2">Away</div>
                <div className="text-sm sm:text-xl md:text-2xl font-black text-white mb-1 sm:mb-2 truncate">{liveGame.awayTeam}</div>
                <div className="text-3xl sm:text-5xl md:text-6xl font-black text-white">{liveGame.awayScore}</div>
              </div>

              {/* Game Info */}
              <div className="text-center border-x border-gray-700">
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2">{liveGame.period}</div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-gray-300 mb-1 sm:mb-3">{liveGame.timeRemaining}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase">{liveGame.gameStatus}</div>
              </div>

              {/* Home Team */}
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase mb-1 sm:mb-2">Home</div>
                <div className="text-sm sm:text-xl md:text-2xl font-black text-green-500 mb-1 sm:mb-2 truncate">{liveGame.homeTeam}</div>
                <div className="text-3xl sm:text-5xl md:text-6xl font-black text-green-500">{liveGame.homeScore}</div>
              </div>
            </div>
          </div>

          {/* Shots on Goal */}
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-xl border-2 sm:border-4 border-black mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-black text-black mb-3 sm:mb-4 text-center uppercase">
              🎯 Shots on Goal
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div className="text-xs sm:text-sm md:text-lg font-bold text-gray-600 uppercase mb-1 sm:mb-2 truncate">{liveGame.awayTeam}</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800">{liveGame.awayShotsOnGoal}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-100 rounded-lg border border-green-500">
                <div className="text-xs sm:text-sm md:text-lg font-bold text-gray-600 uppercase mb-1 sm:mb-2 truncate">{liveGame.homeTeam}</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-green-600">{liveGame.homeShotsOnGoal}</div>
              </div>
            </div>
          </div>

          {/* Penalties */}
          <div className="bg-white rounded-lg shadow-xl border-2 sm:border-4 border-black overflow-hidden">
            <div className="bg-orange-500 p-3 sm:p-4">
              <h2 className="text-lg sm:text-2xl font-black text-white text-center uppercase">
                ⚠️ Penalties
              </h2>
            </div>

            {penalties.length === 0 ? (
              <div className="p-4 sm:p-8 text-center">
                <p className="text-gray-600 font-bold text-base sm:text-lg">No penalties yet</p>
                <p className="text-gray-500 text-xs sm:text-sm">Clean game so far!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-100 border-b-2 sm:border-b-4 border-black">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-black uppercase text-xs sm:text-sm">Period</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-black uppercase text-xs sm:text-sm">Time</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-black uppercase text-xs sm:text-sm">Team</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-black uppercase text-xs sm:text-sm">Player</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-black uppercase text-xs sm:text-sm">Infraction</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black text-black uppercase text-xs sm:text-sm">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penalties.map((penalty, index) => (
                      <tr
                        key={penalty.id}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-black text-gray-800 text-xs sm:text-base">{penalty.period}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-600 text-xs sm:text-base">{penalty.timeOfPenalty}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-base">{penalty.team}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-base">{penalty.player}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-orange-600 text-xs sm:text-base">{penalty.infraction}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black text-orange-600 text-xs sm:text-base">{penalty.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
