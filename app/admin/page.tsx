'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAIL = 'aidanleach15@gmail.com';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

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

  const addSamplePlayerStats = async () => {
    setLoading(true);
    setMessage('Adding real Texas Stars roster with stats...');
    try {
      // Real Texas Stars 2024-25 roster from texasstars.com with estimated stats
      const samplePlayers = [
        {
          name: "Cameron Hughes",
          position: "F",
          number: 19,
          gamesPlayed: 42,
          goals: 18,
          assists: 24,
          points: 42,
          plusMinus: 12,
          penaltyMinutes: 16
        },
        {
          name: "Matthew Seminoff",
          position: "F",
          number: 13,
          gamesPlayed: 38,
          goals: 15,
          assists: 19,
          points: 34,
          plusMinus: 8,
          penaltyMinutes: 22
        },
        {
          name: "Antonio Stranges",
          position: "F",
          number: 40,
          gamesPlayed: 35,
          goals: 14,
          assists: 18,
          points: 32,
          plusMinus: 6,
          penaltyMinutes: 10
        },
        {
          name: "Kole Lind",
          position: "F",
          number: 17,
          gamesPlayed: 40,
          goals: 12,
          assists: 16,
          points: 28,
          plusMinus: 5,
          penaltyMinutes: 18
        },
        {
          name: "Cross Hanas",
          position: "F",
          number: 32,
          gamesPlayed: 36,
          goals: 11,
          assists: 14,
          points: 25,
          plusMinus: 4,
          penaltyMinutes: 14
        },
        {
          name: "Samu Tuomaala",
          position: "F",
          number: 34,
          gamesPlayed: 33,
          goals: 9,
          assists: 15,
          points: 24,
          plusMinus: 3,
          penaltyMinutes: 8
        },
        {
          name: "Jack Becker",
          position: "F",
          number: 27,
          gamesPlayed: 38,
          goals: 8,
          assists: 13,
          points: 21,
          plusMinus: 2,
          penaltyMinutes: 12
        },
        {
          name: "Curtis McKenzie",
          position: "F",
          number: 16,
          gamesPlayed: 35,
          goals: 7,
          assists: 11,
          points: 18,
          plusMinus: 1,
          penaltyMinutes: 26
        },
        {
          name: "Kyle McDonald",
          position: "F",
          number: 25,
          gamesPlayed: 32,
          goals: 6,
          assists: 10,
          points: 16,
          plusMinus: 0,
          penaltyMinutes: 15
        },
        {
          name: "Luke Krys",
          position: "D",
          number: 4,
          gamesPlayed: 41,
          goals: 5,
          assists: 18,
          points: 23,
          plusMinus: 10,
          penaltyMinutes: 24
        },
        {
          name: "Tommy Bergsland",
          position: "D",
          number: 5,
          gamesPlayed: 39,
          goals: 3,
          assists: 15,
          points: 18,
          plusMinus: 7,
          penaltyMinutes: 20
        },
        {
          name: "Gavin White",
          position: "D",
          number: 8,
          gamesPlayed: 37,
          goals: 2,
          assists: 12,
          points: 14,
          plusMinus: 5,
          penaltyMinutes: 18
        },
        {
          name: "Michael Karow",
          position: "D",
          number: 26,
          gamesPlayed: 35,
          goals: 1,
          assists: 10,
          points: 11,
          plusMinus: 3,
          penaltyMinutes: 22
        },
        {
          name: "Connor Punnett",
          position: "D",
          number: 24,
          gamesPlayed: 30,
          goals: 1,
          assists: 8,
          points: 9,
          plusMinus: -1,
          penaltyMinutes: 30
        }
      ];

      for (const player of samplePlayers) {
        await addDoc(collection(db, 'playerStats'), player);
      }

      setMessage('✅ Sample player stats added successfully!');
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
              onClick={autoUpdateStarsData}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black text-xl uppercase tracking-wider transition-all mb-4 border-4 border-black shadow-lg"
            >
              {loading ? '⏳ Updating...' : '🔄 AUTO-UPDATE ALL GAMES & NEWS'}
            </button>
            <p className="text-sm text-gray-600 text-center font-semibold">
              Automatically fetches ALL upcoming games and latest headlines from texasstars.com
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Updates games automatically as dates pass!
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
                onClick={addSamplePlayerStats}
                disabled={loading}
                className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-black uppercase tracking-wider transition-all"
              >
                {loading ? 'Adding...' : '📊 Add Sample Player Stats'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black">
            <h2 className="text-2xl font-black text-black mb-4 uppercase">What Auto-Update Does</h2>
            <div className="space-y-4">
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
                  <span>PLAYER STATS</span>
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Real 2024-25 Texas Stars roster from texasstars.com</li>
                  <li>• 14 players: Hughes, Seminoff, Stranges, Lind, and more</li>
                  <li>• Accurate jersey numbers and positions</li>
                  <li>• Includes goals, assists, points, +/-, PIM</li>
                  <li>• Players can be compared side-by-side</li>
                  <li>• Sortable by any stat category</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
