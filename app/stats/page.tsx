'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PlayerStats {
  id: string;
  name: string;
  position: string;
  number: number;
  gamesPlayed: number;
  // Skater stats
  goals?: number;
  assists?: number;
  points?: number;
  plusMinus?: number;
  penaltyMinutes?: number;
  // Goalie stats
  wins?: number;
  losses?: number;
  overtimeLosses?: number;
  savePercentage?: number;
  goalsAgainstAverage?: number;
  shutouts?: number;
  saves?: number;
  shotsAgainst?: number;
}

interface TeamStats {
  id: string;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  homeRecord: string;
  awayRecord: string;
  streak: string;
  lastUpdated: string;
}

export default function StatsPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('points');

  useEffect(() => {
    const q = query(collection(db, 'playerStats'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PlayerStats));
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'teamStats'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const teamData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as TeamStats;
        setTeamStats(teamData);
      }
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
    const aVal = a[sortBy] ?? -Infinity;
    const bVal = b[sortBy] ?? -Infinity;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      // For GAA, lower is better, so reverse the sort
      if (sortBy === 'goalsAgainstAverage') {
        if (aVal === -Infinity) return 1;
        if (bVal === -Infinity) return -1;
        return aVal - bVal;
      }
      return bVal - aVal;
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
          {/* Team Stats */}
          {teamStats && (
            <div className="bg-gradient-to-r from-black to-gray-900 p-6 rounded-lg shadow-xl border-4 border-white mb-6">
              <h2 className="text-3xl font-black text-white text-center uppercase mb-4">
                🏆 2025-26 Season Team Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center border-2 border-green-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Record</div>
                  <div className="text-2xl font-black text-black">
                    {teamStats.wins}-{teamStats.losses}-{teamStats.overtimeLosses}
                  </div>
                  <div className="text-xs font-bold text-gray-500 mt-1">{teamStats.points} PTS</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Home</div>
                  <div className="text-xl font-black text-blue-600">{teamStats.homeRecord}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-orange-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Away</div>
                  <div className="text-xl font-black text-orange-600">{teamStats.awayRecord}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Streak</div>
                  <div className="text-xl font-black text-purple-600">{teamStats.streak}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-green-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Goals For</div>
                  <div className="text-2xl font-black text-green-600">{teamStats.goalsFor}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-red-500">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Goals Against</div>
                  <div className="text-2xl font-black text-red-600">{teamStats.goalsAgainst}</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-yellow-500 col-span-2">
                  <div className="text-sm font-bold text-gray-600 uppercase mb-1">Goal Differential</div>
                  <div className={`text-2xl font-black ${(teamStats.goalsFor - teamStats.goalsAgainst) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(teamStats.goalsFor - teamStats.goalsAgainst) >= 0 ? '+' : ''}{teamStats.goalsFor - teamStats.goalsAgainst}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      {player.position === 'G' ? (
                        // Goalie stats
                        <>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">GP:</span>
                            <span className="font-black text-black">{player.gamesPlayed}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">Record:</span>
                            <span className="font-black text-black text-lg">{player.wins || 0}-{player.losses || 0}-{player.overtimeLosses || 0}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">SV%:</span>
                            <span className="font-black text-green-600 text-xl">{player.savePercentage ? player.savePercentage.toFixed(3) : '.000'}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">GAA:</span>
                            <span className="font-black text-blue-600 text-lg">{player.goalsAgainstAverage ? player.goalsAgainstAverage.toFixed(2) : '0.00'}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">SO:</span>
                            <span className="font-black text-purple-600">{player.shutouts || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-700">Saves:</span>
                            <span className="font-black text-black">{player.saves || 0}/{player.shotsAgainst || 0}</span>
                          </div>
                        </>
                      ) : (
                        // Skater stats
                        <>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">GP:</span>
                            <span className="font-black text-black">{player.gamesPlayed}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">Goals:</span>
                            <span className="font-black text-green-600 text-lg">{player.goals || 0}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">Assists:</span>
                            <span className="font-black text-blue-600 text-lg">{player.assists || 0}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">Points:</span>
                            <span className="font-black text-black text-xl">{player.points || 0}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-gray-200 pb-1">
                            <span className="font-bold text-gray-700">+/-:</span>
                            <span className={`font-black text-lg ${(player.plusMinus || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(player.plusMinus || 0) >= 0 ? '+' : ''}{player.plusMinus || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-700">PIM:</span>
                            <span className="font-black text-orange-600">{player.penaltyMinutes || 0}</span>
                          </div>
                        </>
                      )}
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
            <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
              <span className="font-black text-black uppercase text-sm">Sort By:</span>
              {(['points', 'goals', 'assists', 'gamesPlayed', 'plusMinus', 'savePercentage', 'goalsAgainstAverage'] as const).map(stat => (
                <button
                  key={stat}
                  onClick={() => setSortBy(stat)}
                  className={`px-3 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    sortBy === stat
                      ? 'bg-green-600 text-white border-2 border-black'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {stat === 'gamesPlayed' ? 'GP' :
                   stat === 'plusMinus' ? '+/-' :
                   stat === 'savePercentage' ? 'SV%' :
                   stat === 'goalsAgainstAverage' ? 'GAA' :
                   stat === 'points' ? 'PTS' :
                   stat === 'goals' ? 'G' :
                   stat === 'assists' ? 'A' : stat}
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
                      <th className="px-3 py-3 text-left font-black text-black uppercase text-xs">Select</th>
                      <th className="px-3 py-3 text-left font-black text-black uppercase text-xs">#</th>
                      <th className="px-3 py-3 text-left font-black text-black uppercase text-xs">Player</th>
                      <th className="px-3 py-3 text-left font-black text-black uppercase text-xs">Pos</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">GP</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">G</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">A</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">PTS</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">+/-</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">PIM</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">SV%</th>
                      <th className="px-3 py-3 text-center font-black text-black uppercase text-xs">GAA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, index) => {
                      const isSelected = selectedPlayers.includes(player.id);
                      const isGoalie = player.position === 'G';
                      return (
                        <tr
                          key={player.id}
                          className={`border-b-2 border-gray-200 hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-green-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-3 py-3">
                            <button
                              onClick={() => togglePlayerSelection(player.id)}
                              disabled={!isSelected && selectedPlayers.length >= 3}
                              className={`px-2 py-1 rounded font-bold text-xs ${
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
                          <td className="px-3 py-3 font-black text-green-600 text-base">#{player.number}</td>
                          <td className="px-3 py-3 font-bold text-black text-sm">{player.name}</td>
                          <td className="px-3 py-3 font-bold text-gray-600 uppercase text-xs">{player.position}</td>
                          <td className="px-3 py-3 text-center font-bold text-sm">{player.gamesPlayed}</td>
                          <td className="px-3 py-3 text-center font-black text-green-600 text-sm">
                            {isGoalie ? '-' : (player.goals || 0)}
                          </td>
                          <td className="px-3 py-3 text-center font-black text-blue-600 text-sm">
                            {isGoalie ? '-' : (player.assists || 0)}
                          </td>
                          <td className="px-3 py-3 text-center font-black text-base">
                            {isGoalie ? `${player.wins || 0}-${player.losses || 0}-${player.overtimeLosses || 0}` : (player.points || 0)}
                          </td>
                          <td className={`px-3 py-3 text-center font-black text-sm ${isGoalie ? 'text-gray-400' : (player.plusMinus || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {isGoalie ? '-' : `${(player.plusMinus || 0) >= 0 ? '+' : ''}${player.plusMinus || 0}`}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-orange-600 text-sm">
                            {isGoalie ? '-' : (player.penaltyMinutes || 0)}
                          </td>
                          <td className="px-3 py-3 text-center font-black text-purple-600 text-sm">
                            {isGoalie ? (player.savePercentage ? player.savePercentage.toFixed(3) : '.000') : '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-black text-blue-600 text-sm">
                            {isGoalie ? (player.goalsAgainstAverage ? player.goalsAgainstAverage.toFixed(2) : '0.00') : '-'}
                          </td>
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
