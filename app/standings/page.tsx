'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface StandingsTeam {
  id: string;
  teamName: string;
  teamCode: string;
  conference: string;
  division: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  winPct: number;
  homeRecord: string;
  awayRecord: string;
  streak: string;
  rank: number;
}

export default function StandingsPage() {
  const [teams, setTeams] = useState<StandingsTeam[]>([]);
  const [filter, setFilter] = useState<'all' | 'division' | 'conference'>('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to manually trigger standings update
  const updateStandings = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-ahl-standings', {
        method: 'POST',
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.success) {
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error updating standings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'standings'), orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StandingsTeam));
      setTeams(teamsData);
      setLoading(false);

      // Get last updated timestamp
      if (teamsData.length > 0) {
        const firstTeam = snapshot.docs[0].data();
        if (firstTeam.lastUpdated) {
          setLastUpdated(firstTeam.lastUpdated.toDate());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh standings every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      updateStandings();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const filterTeams = (teamsList: StandingsTeam[]) => {
    if (filter === 'division') {
      const starsTeam = teamsList.find(t => t.teamCode === 'TEX');
      if (starsTeam) {
        return teamsList.filter(t => t.division === starsTeam.division);
      }
    }
    if (filter === 'conference') {
      const starsTeam = teamsList.find(t => t.teamCode === 'TEX');
      if (starsTeam) {
        return teamsList.filter(t => t.conference === starsTeam.conference);
      }
    }
    return teamsList;
  };

  const groupedTeams = () => {
    const easternTeams = teams.filter(t => t.conference === 'Eastern Conference');
    const westernTeams = teams.filter(t => t.conference === 'Western Conference');

    return {
      eastern: {
        atlantic: easternTeams.filter(t => t.division === 'Atlantic Division').sort((a, b) => b.points - a.points),
        north: easternTeams.filter(t => t.division === 'North Division').sort((a, b) => b.points - a.points)
      },
      western: {
        central: westernTeams.filter(t => t.division === 'Central Division').sort((a, b) => b.points - a.points),
        pacific: westernTeams.filter(t => t.division === 'Pacific Division').sort((a, b) => b.points - a.points)
      }
    };
  };

  const filteredTeams = filterTeams(teams);
  const starsTeam = teams.find(t => t.teamCode === 'TEX');
  const playoffLine = 4; // Top 4 teams make playoffs in AHL
  const grouped = groupedTeams();

  return (
    <ProtectedRoute allowGuests={true}>
      <div className="min-h-screen py-4 sm:py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 mt-16 sm:mt-0">
            <div className="text-5xl sm:text-7xl mb-2">🏆⭐</div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-2 sm:mb-3 tracking-wider px-2" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              AHL STANDINGS
            </h1>
            <p className="text-lg sm:text-xl font-black text-white tracking-wide">2025-26 SEASON STANDINGS</p>
            <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              {lastUpdated && (
                <p className="text-xs sm:text-sm text-white font-bold bg-black/30 px-3 py-1 rounded-full">
                  Last Updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <button
                onClick={updateStandings}
                disabled={isUpdating}
                className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full transition-all ${
                  isUpdating
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-white text-green-700 hover:bg-green-100 border-2 border-black'
                }`}
              >
                {isUpdating ? '🔄 Updating...' : '🔄 Refresh Now'}
              </button>
            </div>
          </div>

          {/* Stars Team Highlight */}
          {starsTeam && (
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 rounded-lg shadow-xl border-2 sm:border-4 border-white mb-4 sm:mb-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">TEXAS STARS</h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white">{starsTeam.points}</div>
                    <div className="text-xs sm:text-sm font-bold text-green-100">Points</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white">
                      {starsTeam.wins}-{starsTeam.losses}-{starsTeam.otLosses}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-green-100">Record</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-white">
                      {starsTeam.rank || teams.findIndex(t => t.id === starsTeam.id) + 1}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-green-100">Rank</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 sm:border-4 border-black mb-4 sm:mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                  filter === 'all'
                    ? 'bg-green-600 text-white border-2 border-black'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                🏒 LEAGUE
              </button>
              <button
                onClick={() => setFilter('division')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                  filter === 'division'
                    ? 'bg-green-600 text-white border-2 border-black'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                📊 DIVISION
              </button>
              <button
                onClick={() => setFilter('conference')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                  filter === 'conference'
                    ? 'bg-green-600 text-white border-2 border-black'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                🌎 CONFERENCE
              </button>
            </div>
          </div>

          {/* Standings Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl sm:text-2xl font-bold">Loading standings...</div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl border-2 sm:border-4 border-black text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-3 sm:mb-4 uppercase">No Standings Data</h2>
              <p className="text-base sm:text-lg text-gray-600 font-bold">
                Standings will be available once the season starts.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-xl border-2 sm:border-4 border-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-black border-b-2 sm:border-b-4 border-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left font-black text-white uppercase text-xs sm:text-sm sticky left-0 bg-black">Rank</th>
                      <th className="px-2 sm:px-4 py-3 text-left font-black text-white uppercase text-xs sm:text-sm sticky left-12 bg-black">Team</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">GP</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">W</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">L</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">OTL</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">PTS</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">GF</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">GA</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">DIFF</th>
                      <th className="px-2 sm:px-4 py-3 text-center font-black text-white uppercase text-xs sm:text-sm">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team, index) => {
                      const isStars = team.teamCode === 'TEX';
                      const isPlayoffTeam = index < playoffLine;
                      const isPlayoffLine = index === playoffLine - 1;

                      return (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-200 ${
                            isStars
                              ? 'bg-green-100'
                              : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${isPlayoffLine ? 'border-b-4 border-green-600' : ''}`}
                        >
                          <td className={`px-2 sm:px-4 py-3 font-black ${isStars ? 'text-green-700' : 'text-gray-800'} text-xs sm:text-base sticky left-0 ${
                            isStars ? 'bg-green-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            {index + 1}
                            {isPlayoffTeam && ' 🟢'}
                          </td>
                          <td className={`px-2 sm:px-4 py-3 font-bold ${isStars ? 'text-green-700' : 'text-black'} text-xs sm:text-base sticky left-12 ${
                            isStars ? 'bg-green-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            {team.teamName}
                            {isStars && ' ⭐'}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.gamesPlayed}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.wins}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.losses}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.otLosses}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-black text-black text-xs sm:text-base">{team.points}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.goalsFor}</td>
                          <td className="px-2 sm:px-4 py-3 text-center font-bold text-gray-700 text-xs sm:text-base">{team.goalsAgainst}</td>
                          <td className={`px-2 sm:px-4 py-3 text-center font-bold text-xs sm:text-base ${
                            team.goalDiff > 0 ? 'text-green-600' : team.goalDiff < 0 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-center text-xs sm:text-base">
                            <span className={`px-2 py-1 rounded-full font-black ${
                              team.streak.startsWith('W')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {team.streak}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Playoff Line Legend */}
              <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                <div className="text-center text-xs sm:text-sm font-bold text-gray-600">
                  🟢 = Playoff Position • Green line indicates playoff cutoff (Top 4)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
