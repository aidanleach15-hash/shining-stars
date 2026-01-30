'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

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

export default function SchedulePage() {
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [filter, setFilter] = useState<'all' | 'home' | 'away' | 'past' | 'upcoming'>('all');
  const [loading, setLoading] = useState(true);

  // Auto-fetch live game data every 30 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        await fetch('/api/auto-update-live-game');
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ScheduleGame));
      setGames(gamesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to live game updates
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

  const filterGames = (gamesList: ScheduleGame[]) => {
    const now = new Date();

    return gamesList.filter(game => {
      const gameDate = game.date?.toDate ? game.date.toDate() : new Date(game.date);

      switch (filter) {
        case 'home':
          return game.isHome;
        case 'away':
          return !game.isHome;
        case 'past':
          return gameDate < now || game.status === 'final';
        case 'upcoming':
          return gameDate >= now && game.status === 'scheduled';
        default:
          return true;
      }
    });
  };

  const filteredGames = filterGames(games);

  const formatGameDate = (date: any) => {
    if (!date) return 'TBD';
    const gameDate = date?.toDate ? date.toDate() : new Date(date);
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextGame = () => {
    const now = new Date();
    return games.find(game => {
      const gameDate = game.date?.toDate ? game.date.toDate() : new Date(game.date);
      return gameDate >= now && game.status === 'scheduled';
    });
  };

  const nextGame = getNextGame();

  return (
    <ProtectedRoute allowGuests={true}>
      <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
            <div className="text-5xl sm:text-7xl mb-2">📅⭐</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              SEASON SCHEDULE
            </h1>
            <p className="text-lg sm:text-xl font-black text-white tracking-wide">2025-26 TEXAS STARS SCHEDULE</p>
          </div>

          {/* Next Game Countdown */}
          {nextGame && (
            <div className="bg-gradient-to-r from-black to-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border-2 sm:border-4 border-white mb-4 sm:mb-6">
              <div className="text-center">
                <p className="text-green-400 font-black text-xs sm:text-sm uppercase tracking-wide mb-2">NEXT GAME</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
                  vs {nextGame.opponent}
                </h2>
                <p className="text-white font-bold text-sm sm:text-base">
                  {formatGameDate(nextGame.date)} • {nextGame.time}
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">
                  {nextGame.location} • {nextGame.isHome ? '🏠 HOME' : '✈️ AWAY'}
                </p>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 sm:border-4 border-black mb-4 sm:mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {['all', 'home', 'away', 'upcoming', 'past'].map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    filter === filterType
                      ? 'bg-green-600 text-white border-2 border-black'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {filterType === 'all' && '📋 ALL GAMES'}
                  {filterType === 'home' && '🏠 HOME'}
                  {filterType === 'away' && '✈️ AWAY'}
                  {filterType === 'upcoming' && '📅 UPCOMING'}
                  {filterType === 'past' && '📝 PAST'}
                </button>
              ))}
            </div>
          </div>

          {/* Games List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl sm:text-2xl font-bold">Loading schedule...</div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border-2 sm:border-4 border-black text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📅</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 uppercase">No Games Found</h2>
              <p className="text-base sm:text-lg text-gray-600 font-bold">
                No games match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredGames.map(game => {
                const gameDate = game.date?.toDate ? game.date.toDate() : new Date(game.date);
                const isPast = gameDate < new Date() || game.status === 'final';

                // Check if this game is the live game
                const isLiveGame = liveGame && (
                  (game.isHome && liveGame.homeTeam === 'Texas Stars' && liveGame.awayTeam.includes(game.opponent.split(' ')[0])) ||
                  (!game.isHome && liveGame.awayTeam === 'Texas Stars' && liveGame.homeTeam.includes(game.opponent.split(' ')[0]))
                );

                const displayStarsScore = isLiveGame ? (game.isHome ? liveGame.homeScore : liveGame.awayScore) : game.starsScore;
                const displayOpponentScore = isLiveGame ? (game.isHome ? liveGame.awayScore : liveGame.homeScore) : game.opponentScore;
                const isGameLive = isLiveGame && liveGame.isLive;

                return (
                  <div
                    key={game.id}
                    className={`bg-white rounded-lg shadow-xl border-2 sm:border-4 border-black overflow-hidden hover:shadow-2xl transition-all ${
                      isGameLive ? 'ring-4 ring-red-500 animate-pulse' : ''
                    }`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Date & Time */}
                        <div className="flex-shrink-0">
                          <div className="text-xs sm:text-sm font-black text-gray-500 uppercase">{formatGameDate(game.date)}</div>
                          <div className="text-base sm:text-lg font-bold text-gray-700">{game.time}</div>
                          {isGameLive && (
                            <div className="mt-1 space-y-1">
                              <div className="text-xs font-black text-red-600 uppercase animate-pulse flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                LIVE
                              </div>
                              <div className="text-xs font-bold text-gray-600">
                                {liveGame.period} - {liveGame.timeRemaining}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Matchup */}
                        <div className="flex-1">
                          <div className="flex items-center justify-center gap-2 sm:gap-4">
                            <div className="text-center flex-1">
                              <div className="text-base sm:text-xl md:text-2xl font-black text-green-600">TEXAS STARS</div>
                              {(game.status === 'final' || isGameLive) && (
                                <div className={`text-2xl sm:text-4xl font-black mt-1 ${isGameLive ? 'text-green-600' : 'text-gray-800'}`}>
                                  {displayStarsScore}
                                </div>
                              )}
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-gray-400">vs</div>
                            <div className="text-center flex-1">
                              <div className="text-base sm:text-xl md:text-2xl font-black text-gray-800">{game.opponent}</div>
                              {(game.status === 'final' || isGameLive) && (
                                <div className={`text-2xl sm:text-4xl font-black mt-1 ${isGameLive ? 'text-red-600' : 'text-gray-800'}`}>
                                  {displayOpponentScore}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location & Status */}
                        <div className="flex-shrink-0 text-center sm:text-right">
                          <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                            <span className="text-lg sm:text-xl">{game.isHome ? '🏠' : '✈️'}</span>
                            <span className="text-xs sm:text-sm font-bold text-gray-700 uppercase">
                              {game.isHome ? 'Home' : 'Away'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">{game.location}</div>
                          {game.status === 'final' && !isGameLive && (
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black inline-block ${
                              game.starsScore! > game.opponentScore!
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {game.starsScore! > game.opponentScore! ? 'W' : 'L'}
                            </div>
                          )}
                          {isGameLive && (
                            <div className="mt-2 px-3 py-1 rounded-full text-xs font-black inline-block bg-red-100 text-red-700 border-2 border-red-600">
                              IN PROGRESS
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 sm:border-4 border-black">
            <h3 className="text-lg sm:text-xl font-black text-black mb-3 uppercase text-center">Season Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-gray-800">{games.length}</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Total Games</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-green-600">
                  {games.filter(g => g.isHome).length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Home</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-blue-600">
                  {games.filter(g => !g.isHome).length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Away</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-black text-gray-800">
                  {games.filter(g => g.status === 'final').length}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
