'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAIL = 'aidanleach15@gmail.com';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // Live game state
  const [liveGameData, setLiveGameData] = useState({
    homeTeam: 'Texas Stars',
    awayTeam: '',
    homeScore: 0,
    awayScore: 0,
    period: '1st Period',
    timeRemaining: '20:00',
    homeShotsOnGoal: 0,
    awayShotsOnGoal: 0,
    isLive: true,
    gameStatus: 'In Progress'
  });

  // Check if user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAdmin && user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen py-8 flex items-center justify-center" style={{backgroundColor: '#007A33'}}>
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg border-4 border-red-500 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-4xl font-black text-red-600 mb-4 uppercase">ACCESS DENIED</h1>
              <p className="text-xl text-gray-700 font-bold mb-4">
                This page is restricted to administrators only.
              </p>
              <p className="text-gray-600">
                If you believe you should have access, contact the site administrator.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const addSampleGame = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Next home game: Friday, January 30, 7:00 PM vs Henderson Silver Knights
      const gameDate = new Date("2026-01-30T19:00:00");

      await addDoc(collection(db, 'games'), {
        opponent: "HENDERSON SILVER KNIGHTS",
        location: "H-E-B Center at Cedar Park",
        isHome: true,
        date: gameDate,
        time: "7:00 PM CT"
      });

      setMessage('✅ Next game added successfully! (Jan 30 vs Henderson)');
    } catch (error: any) {
      setMessage('❌ Error adding game: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSampleHeadlines = async () => {
    setLoading(true);
    setMessage('');
    try {
      const headlines = [
        {
          title: "STARS BLANK ICEHOGS IN THIRD STRAIGHT WIN",
          summary: "Texas defeated Rockford 5-0, recording a dominant shutout victory against the IceHogs in their third consecutive win!",
          link: "https://www.texasstars.com",
          createdAt: serverTimestamp()
        },
        {
          title: "CAMERON HUGHES SELECTED TO AHL ALL-STAR CLASSIC",
          summary: "Texas forward Cameron Hughes earned recognition and selection to the league's prestigious all-star event!",
          link: "https://www.texasstars.com",
          createdAt: serverTimestamp()
        },
        {
          title: "STAR WARS™ NIGHT IS JANUARY 30!",
          summary: "Join us for an epic Star Wars™ themed night when the Stars take on Henderson Silver Knights this Friday!",
          link: "https://www.texasstars.com",
          createdAt: serverTimestamp()
        },
        {
          title: "BREAKOUT SEASON FOR MATTHEW SEMINOFF FUELED BY WORK ETHIC",
          summary: "Feature on forward Matthew Seminoff's outstanding performance this season, driven by his dedication and commitment to the game.",
          link: "https://www.texasstars.com",
          createdAt: serverTimestamp()
        },
        {
          title: "STARS WIN GOAL FEST IN IOWA",
          summary: "The Stars mounted an incredible comeback, rallying from a two-goal deficit to secure victory on the road!",
          link: "https://www.texasstars.com",
          createdAt: serverTimestamp()
        }
      ];

      for (const headline of headlines) {
        await addDoc(collection(db, 'headlines'), headline);
      }

      setMessage('✅ All headlines added successfully!');
    } catch (error: any) {
      setMessage('❌ Error adding headlines: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAllSampleData = async () => {
    setLoading(true);
    setMessage('Adding all sample data...');
    await addSampleGame();
    await addSampleHeadlines();
    setMessage('✅ All sample data added successfully!');
    setLoading(false);
  };

  const autoUpdateStarsData = async () => {
    setLoading(true);
    setMessage('🔄 Fetching latest data from texasstars.com...');
    try {
      const response = await fetch('/api/update-stars-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const autoUpdatePlayerStats = async () => {
    setLoading(true);
    setMessage('🔄 Updating player stats...');
    try {
      const response = await fetch('/api/update-player-stats', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const autoUpdateTeamStats = async () => {
    setLoading(true);
    setMessage('🔄 Updating team stats...');
    try {
      const response = await fetch('/api/update-team-stats', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateLiveGame = async () => {
    setLoading(true);
    setMessage('🔄 Updating live game...');
    try {
      const response = await fetch('/api/update-live-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liveGameData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearPenalties = async () => {
    setLoading(true);
    setMessage('🔄 Clearing penalties...');
    try {
      const response = await fetch('/api/clear-penalties', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const endLiveGame = async () => {
    setLoading(true);
    setMessage('🔄 Ending live game...');
    try {
      const response = await fetch('/api/update-live-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...liveGameData,
          isLive: false,
          gameStatus: 'Final'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Game ended successfully`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveGameNow = async () => {
    setLoading(true);
    setMessage('🔄 Fetching live game data from AHL...');
    try {
      const response = await fetch('/api/auto-update-live-game');
      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMerch = async () => {
    setLoading(true);
    setMessage('🔄 Fetching merchandise...');
    try {
      const response = await fetch('/api/fetch-merch');
      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const autoUpdateEverything = async () => {
    setLoading(true);
    setMessage('🔄 Updating EVERYTHING (games, news, player stats, and team stats)...');
    try {
      // Update games and news
      const gamesResponse = await fetch('/api/update-stars-data', {
        method: 'POST',
      });
      const gamesData = await gamesResponse.json();

      // Update player stats
      const statsResponse = await fetch('/api/update-player-stats', {
        method: 'POST',
      });
      const statsData = await statsResponse.json();

      // Update team stats
      const teamResponse = await fetch('/api/update-team-stats', {
        method: 'POST',
      });
      const teamData = await teamResponse.json();

      if (gamesData.success && statsData.success && teamData.success) {
        setMessage(`✅ Complete update: ${gamesData.message} + ${statsData.message} + Team stats updated`);
      } else {
        setMessage(`❌ Error: ${gamesData.error || statsData.error || teamData.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllPlayerStats = async () => {
    setLoading(true);
    setMessage('Deleting all player stats from database...');
    try {
      const statsQuery = query(collection(db, 'playerStats'));
      const statsSnapshot = await getDocs(statsQuery);

      let deletedCount = 0;
      for (const doc of statsSnapshot.docs) {
        await deleteDoc(doc.ref);
        deletedCount++;
      }

      setMessage(`✅ Deleted ${deletedCount} player entries. Database is now empty.`);
    } catch (error: any) {
      setMessage('❌ Error clearing stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSamplePlayerStats = async () => {
    setLoading(true);
    setMessage('Clearing old stats and adding fresh 2025-26 season data...');
    try {
      // Clear existing player stats first
      const statsQuery = query(collection(db, 'playerStats'));
      const statsSnapshot = await getDocs(statsQuery);
      for (const doc of statsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // REAL Texas Stars 2025-26 season stats from AHL/QuantHockey
      const samplePlayers = [
        // FORWARDS
        { name: "Cameron Hughes", position: "F", number: 19, gamesPlayed: 41, goals: 9, assists: 29, points: 38, plusMinus: 3, penaltyMinutes: 18 },
        { name: "Matthew Seminoff", position: "F", number: 13, gamesPlayed: 41, goals: 10, assists: 12, points: 22, plusMinus: 9, penaltyMinutes: 14 },
        { name: "Cross Hanas", position: "F", number: 32, gamesPlayed: 32, goals: 8, assists: 12, points: 20, plusMinus: 0, penaltyMinutes: 18 },
        { name: "Kole Lind", position: "F", number: 17, gamesPlayed: 40, goals: 7, assists: 13, points: 20, plusMinus: -11, penaltyMinutes: 63 },
        { name: "Antonio Stranges", position: "F", number: 40, gamesPlayed: 39, goals: 9, assists: 10, points: 19, plusMinus: -21, penaltyMinutes: 4 },
        { name: "Harrison Scott", position: "F", number: 11, gamesPlayed: 41, goals: 9, assists: 10, points: 19, plusMinus: 3, penaltyMinutes: 18 },
        { name: "Artem Shlaine", position: "F", number: 38, gamesPlayed: 40, goals: 11, assists: 7, points: 18, plusMinus: -3, penaltyMinutes: 8 },
        { name: "Jack Becker", position: "F", number: 27, gamesPlayed: 40, goals: 8, assists: 8, points: 16, plusMinus: 1, penaltyMinutes: 27 },
        { name: "Arttu Hyry", position: "F", number: 12, gamesPlayed: 22, goals: 5, assists: 8, points: 13, plusMinus: -7, penaltyMinutes: 13 },
        { name: "Curtis McKenzie", position: "F", number: 16, gamesPlayed: 41, goals: 5, assists: 8, points: 13, plusMinus: -5, penaltyMinutes: 42 },
        { name: "Samu Tuomaala", position: "F", number: 34, gamesPlayed: 16, goals: 2, assists: 8, points: 10, plusMinus: -4, penaltyMinutes: 2 },
        { name: "Kyle McDonald", position: "F", number: 25, gamesPlayed: 14, goals: 1, assists: 6, points: 7, plusMinus: -2, penaltyMinutes: 2 },
        { name: "Ayrton Martino", position: "F", number: 20, gamesPlayed: 21, goals: 1, assists: 5, points: 6, plusMinus: 2, penaltyMinutes: 0 },
        { name: "Sean Chisholm", position: "F", number: 21, gamesPlayed: 23, goals: 1, assists: 1, points: 2, plusMinus: 0, penaltyMinutes: 27 },
        { name: "Justin Ertel", position: "F", number: 10, gamesPlayed: 24, goals: 1, assists: 1, points: 2, plusMinus: -2, penaltyMinutes: 20 },
        { name: "Chase Wheatcroft", position: "F", number: 29, gamesPlayed: 8, goals: 0, assists: 0, points: 0, plusMinus: 1, penaltyMinutes: 4 },

        // DEFENSEMEN
        { name: "Michael Karow", position: "D", number: 26, gamesPlayed: 39, goals: 5, assists: 11, points: 16, plusMinus: 17, penaltyMinutes: 12 },
        { name: "Tristan Bertucci", position: "D", number: 3, gamesPlayed: 35, goals: 3, assists: 13, points: 16, plusMinus: 1, penaltyMinutes: 24 },
        { name: "Trey Taylor", position: "D", number: 2, gamesPlayed: 40, goals: 5, assists: 8, points: 13, plusMinus: -4, penaltyMinutes: 16 },
        { name: "Luke Krys", position: "D", number: 4, gamesPlayed: 9, goals: 2, assists: 3, points: 5, plusMinus: 5, penaltyMinutes: 4 },
        { name: "Kyle Looft", position: "D", number: 37, gamesPlayed: 28, goals: 4, assists: 1, points: 5, plusMinus: -12, penaltyMinutes: 18 },
        { name: "Gavin White", position: "D", number: 8, gamesPlayed: 22, goals: 3, assists: 2, points: 5, plusMinus: -5, penaltyMinutes: 8 },
        { name: "Tommy Bergsland", position: "D", number: 5, gamesPlayed: 32, goals: 0, assists: 5, points: 5, plusMinus: -1, penaltyMinutes: 12 },
        { name: "Connor Punnett", position: "D", number: 24, gamesPlayed: 18, goals: 0, assists: 2, points: 2, plusMinus: -1, penaltyMinutes: 13 },

        // GOALIES (2025-26 season stats)
        { name: "Remi Poirier", position: "G", number: 1, gamesPlayed: 27, wins: 11, losses: 12, overtimeLosses: 1, savePercentage: 0.895, goalsAgainstAverage: 3.37, shutouts: 1, saves: 719, shotsAgainst: 803 },
        { name: "Arno Tiefensee", position: "G", number: 30, gamesPlayed: 12, wins: 5, losses: 6, overtimeLosses: 0, savePercentage: 0.886, goalsAgainstAverage: 3.54, shutouts: 0, saves: 327, shotsAgainst: 369 }
      ];

      for (const player of samplePlayers) {
        await addDoc(collection(db, 'playerStats'), player);
      }

      setMessage('✅ Player stats refreshed! Each player now appears once with correct stats.');
    } catch (error: any) {
      setMessage('❌ Error adding player stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">⚙️</div>
            <h1 className="text-5xl font-black text-black mb-2 tracking-wider" style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
            }}>
              ADMIN
            </h1>
            <p className="text-lg text-white font-bold">Add Real Texas Stars Data</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg font-bold text-center ${
              message.includes('❌')
                ? 'bg-red-100 text-red-700 border-4 border-red-500'
                : 'bg-green-100 text-green-700 border-4 border-green-500'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4 uppercase flex items-center space-x-2">
              <span>🔄</span>
              <span>Auto-Update (Recommended)</span>
            </h2>
            <button
              onClick={autoUpdateEverything}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black text-xl uppercase tracking-wider transition-all mb-4 border-4 border-black shadow-lg"
            >
              {loading ? '⏳ Updating...' : '🔄 AUTO-UPDATE EVERYTHING'}
            </button>
            <p className="text-sm text-gray-600 text-center font-semibold mb-4">
              Updates ALL data: games, news, player stats, AND team stats in one click!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={autoUpdateStarsData}
                disabled={loading}
                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold uppercase text-xs transition-all"
              >
                {loading ? '⏳' : '🏒'} Games & News
              </button>
              <button
                onClick={autoUpdatePlayerStats}
                disabled={loading}
                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold uppercase text-xs transition-all"
              >
                {loading ? '⏳' : '📊'} Player Stats
              </button>
              <button
                onClick={autoUpdateTeamStats}
                disabled={loading}
                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold uppercase text-xs transition-all"
              >
                {loading ? '⏳' : '🏆'} Team Stats
              </button>
              <button
                onClick={fetchMerch}
                disabled={loading}
                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold uppercase text-xs transition-all"
              >
                {loading ? '⏳' : '🛍️'} Merch
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Click individual buttons above to update specific data types
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4 uppercase">Quick Setup (Manual)</h2>
            <button
              onClick={addAllSampleData}
              disabled={loading}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black text-xl uppercase tracking-wider transition-all mb-4 border-3 border-black"
            >
              {loading ? '⏳ Adding Data...' : '⭐ ADD SINGLE GAME MANUALLY'}
            </button>
            <p className="text-sm text-gray-600 text-center">
              This will add only the next game and headlines (manual option)
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black mb-6">
            <h2 className="text-2xl font-black text-black mb-4 uppercase">Individual Actions</h2>
            <div className="space-y-3">
              <button
                onClick={addSampleGame}
                disabled={loading}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? 'Adding...' : '🏒 Add Next Game (Jan 30 vs Henderson)'}
              </button>
              <button
                onClick={addSampleHeadlines}
                disabled={loading}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? 'Adding...' : '📰 Add Real Headlines'}
              </button>
              <button
                onClick={clearAllPlayerStats}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all border-2 border-red-800"
              >
                {loading ? 'Deleting...' : '🗑️ CLEAR ALL PLAYER STATS (Delete Duplicates)'}
              </button>
              <button
                onClick={addSamplePlayerStats}
                disabled={loading}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? 'Adding...' : '📊 Add 2025-26 Season Stats (All Players + Goalies)'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg shadow-lg border-4 border-blue-500 mb-6">
            <h2 className="text-2xl font-black text-blue-700 mb-4 uppercase flex items-center space-x-2">
              <span>⚡</span>
              <span>Automatic Live Game Updates</span>
            </h2>
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300 mb-4">
              <p className="text-sm text-gray-700 font-bold mb-3">
                🤖 <strong>Auto-Update is ON!</strong> The Game Day page automatically fetches live scores from the AHL every 30 seconds.
              </p>
              <p className="text-xs text-gray-600 mb-3">
                No manual entry needed - scores, shots, and penalties update automatically during games!
              </p>
              <button
                onClick={fetchLiveGameNow}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? '⏳ Fetching...' : '🔄 FETCH LIVE DATA NOW'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow-lg border-4 border-red-500 mb-6">
            <h2 className="text-2xl font-black text-red-700 mb-4 uppercase flex items-center space-x-2">
              <span>🏒</span>
              <span>Manual Game Control (Override)</span>
            </h2>
            <p className="text-xs text-gray-600 mb-4 font-bold">
              Use this only if you need to manually override the automatic updates
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Away Team</label>
                <input
                  type="text"
                  value={liveGameData.awayTeam}
                  onChange={(e) => setLiveGameData({...liveGameData, awayTeam: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold"
                  placeholder="Opponent Name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Period</label>
                <select
                  value={liveGameData.period}
                  onChange={(e) => setLiveGameData({...liveGameData, period: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold"
                >
                  <option>1st Period</option>
                  <option>2nd Period</option>
                  <option>3rd Period</option>
                  <option>OT</option>
                  <option>SO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Texas Stars Score</label>
                <input
                  type="number"
                  value={liveGameData.homeScore}
                  onChange={(e) => setLiveGameData({...liveGameData, homeScore: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-2xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Opponent Score</label>
                <input
                  type="number"
                  value={liveGameData.awayScore}
                  onChange={(e) => setLiveGameData({...liveGameData, awayScore: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-2xl text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Texas Stars SOG</label>
                <input
                  type="number"
                  value={liveGameData.homeShotsOnGoal}
                  onChange={(e) => setLiveGameData({...liveGameData, homeShotsOnGoal: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-xl text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Opponent SOG</label>
                <input
                  type="number"
                  value={liveGameData.awayShotsOnGoal}
                  onChange={(e) => setLiveGameData({...liveGameData, awayShotsOnGoal: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-xl text-center"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">Time Remaining</label>
              <input
                type="text"
                value={liveGameData.timeRemaining}
                onChange={(e) => setLiveGameData({...liveGameData, timeRemaining: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-bold text-center text-xl"
                placeholder="20:00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={updateLiveGame}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all border-2 border-red-800"
              >
                {loading ? '⏳ Updating...' : '🔴 UPDATE LIVE GAME'}
              </button>
              <button
                onClick={endLiveGame}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? '⏳' : '⏹️ END GAME'}
              </button>
            </div>

            <button
              onClick={clearPenalties}
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
            >
              {loading ? '⏳ Clearing...' : '🗑️ CLEAR ALL PENALTIES'}
            </button>

            <p className="text-xs text-gray-600 text-center mt-4 font-bold">
              Updates appear instantly on the Game Day page
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black">
            <h2 className="text-2xl font-black text-black mb-4 uppercase">What Auto-Update Does</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-500">
                <h3 className="font-black text-green-700 mb-2 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>REAL-TIME AUTO-UPDATE</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Updates games, news, player stats, AND team stats automatically</li>
                  <li>• Fetches latest data from official sources</li>
                  <li>• Removes outdated information automatically</li>
                  <li>• No manual data entry needed!</li>
                  <li>• Click once to update everything</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
                <h3 className="font-black text-green-700 mb-2 flex items-center space-x-2">
                  <span>🔄</span>
                  <span>AUTOMATIC GAME MANAGEMENT</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Fetches ALL upcoming games from schedule</li>
                  <li>• Automatically removes past games</li>
                  <li>• Always shows the next upcoming game</li>
                  <li>• Includes 5+ future games in rotation</li>
                  <li>• Home and away games included</li>
                  <li>• Countdown timer updates in real-time</li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-black mb-2 flex items-center space-x-2">
                  <span>🏒</span>
                  <span>UPCOMING GAMES ADDED</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Jan 30: vs Henderson Silver Knights (Star Wars™ Night)</li>
                  <li>• Jan 31: vs Henderson Silver Knights</li>
                  <li>• Feb 6: vs Manitoba Moose</li>
                  <li>• Feb 7: vs Manitoba Moose</li>
                  <li>• Feb 13: @ Grand Rapids Griffins (Away)</li>
                  <li>• + More games as they're scheduled</li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-black mb-2 flex items-center space-x-2">
                  <span>📰</span>
                  <span>LATEST HEADLINES</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• 5-0 shutout win over IceHogs</li>
                  <li>• Cameron Hughes selected to AHL All-Star</li>
                  <li>• Star Wars™ Night announcement</li>
                  <li>• Matthew Seminoff breakout season</li>
                  <li>• Comeback victory in Iowa</li>
                  <li>• All fresh content from texasstars.com</li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-black mb-2 flex items-center space-x-2">
                  <span>📊</span>
                  <span>PLAYER STATS (2025-26 SEASON)</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• REAL 2025-26 current season stats from AHL</li>
                  <li>• Complete roster: 26 players + 2 goalies</li>
                  <li>• 16 forwards, 8 defensemen, 2 goalies</li>
                  <li>• Accurate jersey numbers and positions</li>
                  <li>• Includes goals, assists, points, +/-, PIM, games played</li>
                  <li>• Goalie stats: SV%, GAA, W-L-OTL, shutouts, saves</li>
                  <li>• Stats updated as of current season</li>
                  <li>• Players can be compared side-by-side on Stats page</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-500">
                <h3 className="font-black text-yellow-700 mb-2 flex items-center space-x-2">
                  <span>🏆</span>
                  <span>TEAM STATS (2025-26 SEASON)</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Overall team record (wins-losses-OT losses)</li>
                  <li>• Total points and standings position</li>
                  <li>• Home and away records</li>
                  <li>• Current winning/losing streak</li>
                  <li>• Goals for and goals against</li>
                  <li>• Goal differential (+/-)</li>
                  <li>• Updated automatically with latest results</li>
                  <li>• Displayed at top of Stats page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
