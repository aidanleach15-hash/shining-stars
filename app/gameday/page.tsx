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
        <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="text-7xl mb-2">🏒📺</div>
              <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
              }}>
                GAME DAY
              </h1>
              <p className="text-xl font-black text-white tracking-wide">LIVE GAME CENTER</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl border-4 border-black text-center">
              <div className="text-6xl mb-4">🏒</div>
              <h2 className="text-3xl font-black text-gray-800 mb-4 uppercase">No Live Game</h2>
              <p className="text-lg text-gray-600 font-bold mb-2">
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
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-2">🏒📺</div>
            <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              GAME DAY
            </h1>
            <p className="text-xl font-black text-white tracking-wide">LIVE GAME CENTER</p>
          </div>

          {/* Live Indicator */}
          {liveGame.isLive && (
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase text-sm flex items-center gap-2 animate-pulse border-4 border-white shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                LIVE NOW
              </div>
            </div>
          )}

          {/* Scoreboard */}
          <div className="bg-black p-6 rounded-lg shadow-xl border-4 border-white mb-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Away Team */}
              <div className="text-center">
                <div className="text-sm font-bold text-gray-400 uppercase mb-2">Away</div>
                <div className="text-2xl font-black text-white mb-2">{liveGame.awayTeam}</div>
                <div className="text-6xl font-black text-white">{liveGame.awayScore}</div>
              </div>

              {/* Game Info */}
              <div className="text-center border-x-2 border-gray-700">
                <div className="text-3xl font-black text-white mb-2">{liveGame.period}</div>
                <div className="text-xl font-bold text-gray-300 mb-3">{liveGame.timeRemaining}</div>
                <div className="text-sm font-bold text-gray-400 uppercase">{liveGame.gameStatus}</div>
              </div>

              {/* Home Team */}
              <div className="text-center">
                <div className="text-sm font-bold text-gray-400 uppercase mb-2">Home</div>
                <div className="text-2xl font-black text-green-500 mb-2">{liveGame.homeTeam}</div>
                <div className="text-6xl font-black text-green-500">{liveGame.homeScore}</div>
              </div>
            </div>
          </div>

          {/* Shots on Goal */}
          <div className="bg-white p-6 rounded-lg shadow-xl border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4 text-center uppercase">
              🎯 Shots on Goal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                <div className="text-lg font-bold text-gray-600 uppercase mb-2">{liveGame.awayTeam}</div>
                <div className="text-5xl font-black text-gray-800">{liveGame.awayShotsOnGoal}</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-500">
                <div className="text-lg font-bold text-gray-600 uppercase mb-2">{liveGame.homeTeam}</div>
                <div className="text-5xl font-black text-green-600">{liveGame.homeShotsOnGoal}</div>
              </div>
            </div>
          </div>

          {/* Penalties */}
          <div className="bg-white rounded-lg shadow-xl border-4 border-black overflow-hidden">
            <div className="bg-orange-500 p-4">
              <h2 className="text-2xl font-black text-white text-center uppercase">
                ⚠️ Penalties
              </h2>
            </div>

            {penalties.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 font-bold text-lg">No penalties yet</p>
                <p className="text-gray-500 text-sm">Clean game so far!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-4 border-black">
                    <tr>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Period</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Time</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Team</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Player</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Infraction</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penalties.map((penalty, index) => (
                      <tr
                        key={penalty.id}
                        className={`border-b-2 border-gray-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-black text-gray-800">{penalty.period}</td>
                        <td className="px-4 py-3 font-bold text-gray-600">{penalty.timeOfPenalty}</td>
                        <td className="px-4 py-3 font-bold text-black">{penalty.team}</td>
                        <td className="px-4 py-3 font-bold text-black">{penalty.player}</td>
                        <td className="px-4 py-3 font-bold text-orange-600">{penalty.infraction}</td>
                        <td className="px-4 py-3 text-center font-black text-orange-600">{penalty.minutes}</td>
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
