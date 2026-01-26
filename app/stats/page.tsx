'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PlayerStats {
  id: string;
  name: string;
  position: string;
  number: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
}

export default function StatsPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('points');

  useEffect(() => {
    const q = query(collection(db, 'playerStats'), orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PlayerStats));
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, []);

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < 3) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
      return (b[sortBy] as number) - (a[sortBy] as number);
    }
    return 0;
  });

  const selectedPlayerData = selectedPlayers.map(id =>
    players.find(p => p.id === id)
  ).filter(Boolean) as PlayerStats[];

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">📊🏒</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            PLAYER STATS
          </h1>
          <p className="text-xl font-black text-white tracking-wide">COMPARE THE STARS</p>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Instructions */}
          <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-black mb-6">
            <p className="text-center font-bold text-black">
              {selectedPlayers.length === 0
                ? '👇 SELECT UP TO 3 PLAYERS TO COMPARE'
                : `${selectedPlayers.length}/3 PLAYERS SELECTED - Click more to compare!`}
            </p>
          </div>

          {/* Comparison View */}
          {selectedPlayerData.length > 0 && (
            <div className="bg-black p-6 rounded-lg shadow-xl border-4 border-white mb-6">
              <h2 className="text-3xl font-black text-white mb-6 text-center uppercase">
                ⚔️ Player Comparison
              </h2>
              <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${selectedPlayerData.length}, 1fr)`}}>
                {selectedPlayerData.map(player => (
                  <div key={player.id} className="bg-white rounded-lg p-4 border-3 border-green-500">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-black text-green-600">#{player.number}</div>
                      <h3 className="text-xl font-black text-black uppercase mt-2">{player.name}</h3>
                      <p className="text-sm font-bold text-gray-600 uppercase">{player.position}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                        <span className="font-bold text-gray-700">GP:</span>
                        <span className="font-black text-black">{player.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                        <span className="font-bold text-gray-700">Goals:</span>
                        <span className="font-black text-green-600 text-lg">{player.goals}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                        <span className="font-bold text-gray-700">Assists:</span>
                        <span className="font-black text-blue-600 text-lg">{player.assists}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                        <span className="font-bold text-gray-700">Points:</span>
                        <span className="font-black text-black text-xl">{player.points}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                        <span className="font-bold text-gray-700">+/-:</span>
                        <span className={`font-black text-lg ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {player.plusMinus >= 0 ? '+' : ''}{player.plusMinus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-700">PIM:</span>
                        <span className="font-black text-orange-600">{player.penaltyMinutes}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlayerSelection(player.id)}
                      className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold uppercase text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort Controls */}
          <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-black mb-6">
            <div className="flex items-center justify-center space-x-4 flex-wrap">
              <span className="font-black text-black uppercase">Sort By:</span>
              {(['points', 'goals', 'assists', 'gamesPlayed', 'plusMinus'] as const).map(stat => (
                <button
                  key={stat}
                  onClick={() => setSortBy(stat)}
                  className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                    sortBy === stat
                      ? 'bg-green-600 text-white border-2 border-black'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {stat === 'gamesPlayed' ? 'Games' : stat === 'plusMinus' ? '+/-' : stat}
                </button>
              ))}
            </div>
          </div>

          {/* All Players List */}
          <div className="bg-white rounded-lg shadow-xl border-4 border-black overflow-hidden">
            <div className="bg-black p-4">
              <h2 className="text-3xl font-black text-white text-center uppercase">
                🏒 2025-26 Roster
              </h2>
            </div>

            {players.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 font-bold text-lg mb-2">No player stats available yet</p>
                <p className="text-gray-500 text-sm">Stats will appear here once added by the admin</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-4 border-black">
                    <tr>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Select</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">#</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Player</th>
                      <th className="px-4 py-3 text-left font-black text-black uppercase text-sm">Pos</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">GP</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">G</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">A</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">PTS</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">+/-</th>
                      <th className="px-4 py-3 text-center font-black text-black uppercase text-sm">PIM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, index) => {
                      const isSelected = selectedPlayers.includes(player.id);
                      return (
                        <tr
                          key={player.id}
                          className={`border-b-2 border-gray-200 hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-green-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => togglePlayerSelection(player.id)}
                              disabled={!isSelected && selectedPlayers.length >= 3}
                              className={`px-3 py-1 rounded font-bold text-sm ${
                                isSelected
                                  ? 'bg-green-600 text-white'
                                  : selectedPlayers.length >= 3
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800'
                              }`}
                            >
                              {isSelected ? '✓' : '+'}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-black text-green-600 text-lg">#{player.number}</td>
                          <td className="px-4 py-3 font-bold text-black">{player.name}</td>
                          <td className="px-4 py-3 font-bold text-gray-600 uppercase">{player.position}</td>
                          <td className="px-4 py-3 text-center font-bold">{player.gamesPlayed}</td>
                          <td className="px-4 py-3 text-center font-black text-green-600">{player.goals}</td>
                          <td className="px-4 py-3 text-center font-black text-blue-600">{player.assists}</td>
                          <td className="px-4 py-3 text-center font-black text-lg">{player.points}</td>
                          <td className={`px-4 py-3 text-center font-black ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {player.plusMinus >= 0 ? '+' : ''}{player.plusMinus}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-orange-600">{player.penaltyMinutes}</td>
                        </tr>
                      );
                    })}
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
