'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface RosterPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  height: string;
  weight: number;
  birthDate: string;
  birthPlace: string;
  status: 'active' | 'injured' | 'called_up';
  gamesPlayed: number;
  season: string;
}

export default function RosterPage() {
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [filter, setFilter] = useState<'all' | 'F' | 'D' | 'G'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'roster'), orderBy('number', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RosterPlayer));
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filterPlayers = (playersList: RosterPlayer[]) => {
    if (filter === 'all') return playersList;
    return playersList.filter(player => player.position === filter);
  };

  const filteredPlayers = filterPlayers(players);

  const getPositionLabel = (pos: string) => {
    if (pos === 'F') return 'Forward';
    if (pos === 'D') return 'Defense';
    if (pos === 'G') return 'Goalie';
    return pos;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black">✓ ACTIVE</span>;
      case 'injured':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black">🤕 INJURED</span>;
      case 'called_up':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black">⬆️ CALLED UP</span>;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute allowGuests={true}>
      <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
            <div className="text-5xl sm:text-7xl mb-2">👥⭐</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              TEAM ROSTER
            </h1>
            <p className="text-lg sm:text-xl font-black text-white tracking-wide">2025-26 TEXAS STARS</p>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 sm:border-4 border-black mb-4 sm:mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {[
                { key: 'all', label: '🏒 ALL PLAYERS' },
                { key: 'F', label: '⚡ FORWARDS' },
                { key: 'D', label: '🛡️ DEFENSE' },
                { key: 'G', label: '🥅 GOALIES' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    filter === key
                      ? 'bg-green-600 text-white border-2 border-black'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl sm:text-2xl font-bold">Loading roster...</div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border-2 sm:border-4 border-black text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👥</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 uppercase">No Players Found</h2>
              <p className="text-base sm:text-lg text-gray-600 font-bold">
                Roster information will be available soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPlayers.map(player => (
                <div
                  key={player.id}
                  className="bg-white rounded-lg shadow-xl border-2 sm:border-4 border-black overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-center">
                    <div className="text-5xl font-black text-white mb-1">#{player.number}</div>
                    <div className="text-sm font-bold text-green-100 uppercase">{getPositionLabel(player.position)}</div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-black text-black mb-2 text-center">{player.name}</h3>

                    <div className="space-y-2 mb-3">
                      {player.height !== '-' && (
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-600">Height:</span>
                          <span className="font-black text-gray-800">{player.height}</span>
                        </div>
                      )}
                      {player.weight > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-600">Weight:</span>
                          <span className="font-black text-gray-800">{player.weight} lbs</span>
                        </div>
                      )}
                      {player.birthPlace !== '-' && (
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-600">Birthplace:</span>
                          <span className="font-black text-gray-800 text-right">{player.birthPlace}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-600">Games:</span>
                        <span className="font-black text-gray-800">{player.gamesPlayed}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      {getStatusBadge(player.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Roster Stats */}
          <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 sm:border-4 border-black">
            <h3 className="text-lg sm:text-xl font-black text-black mb-3 uppercase text-center">Roster Summary</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-gray-800">
                  {players.filter(p => p.position === 'F').length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Forwards</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-gray-800">
                  {players.filter(p => p.position === 'D').length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Defense</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-gray-800">
                  {players.filter(p => p.position === 'G').length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Goalies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
