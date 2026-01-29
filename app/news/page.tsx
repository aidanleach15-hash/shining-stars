'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Game {
  id: string;
  opponent: string;
  location: string;
  isHome: boolean;
  date: any;
  time: string;
  bettingOdds?: {
    starsMoneyline: string;
    opponentMoneyline: string;
    overUnder: string;
    spread: string;
  };
}

interface Headline {
  id: string;
  title: string;
  summary: string;
  link?: string;
  createdAt: any;
}

export default function NewsPage() {
  const [nextGame, setNextGame] = useState<Game | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [timeUntilGame, setTimeUntilGame] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Auto-update betting odds on load (silently, don't block page)
  useEffect(() => {
    const updateOdds = async () => {
      try {
        const response = await fetch('/api/update-betting-odds');
        if (!response.ok) {
          console.warn('Betting odds update failed, using defaults');
        }
      } catch (error) {
        console.warn('Error updating betting odds, using defaults:', error);
      }
    };

    updateOdds();
  }, []);

  // Fetch next game
  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      orderBy('date', 'asc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameData = snapshot.docs[0].data() as Game;
        setNextGame({
          ...gameData,
          id: snapshot.docs[0].id,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch headlines
  useEffect(() => {
    const q = query(
      collection(db, 'headlines'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const headlinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Headline));
      setHeadlines(headlinesData);
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!nextGame?.date) return;

    const updateCountdown = () => {
      const gameDate = nextGame.date.toDate();
      const now = new Date();
      const difference = gameDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeUntilGame({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeUntilGame({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextGame]);

  const formatGameDate = (date: any) => {
    if (!date?.toDate) return '';
    return date.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{backgroundColor: '#007A33'}}>
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 text-center px-4">
          <div className="text-7xl mb-2">🏒⭐</div>
          <h1 className="text-6xl font-black text-black mb-3 tracking-wider" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
          }}>
            STARS NEWS
          </h1>
          <p className="text-xl font-black text-white tracking-wide">STAY UP TO DATE WITH THE STARS</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Next Game Countdown */}
          {nextGame ? (
            <div className="bg-black rounded-lg shadow-xl p-8 border-4 border-white">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-wide">
                  ⏰ NEXT GAME
                </h2>
                <p className="text-green-400 font-bold text-lg">
                  {formatGameDate(nextGame.date)} • {nextGame.time}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border-3 border-green-500 text-center">
                  <div className="text-5xl font-black text-black">{timeUntilGame.days}</div>
                  <div className="text-sm font-black text-gray-600 uppercase tracking-wide mt-1">Days</div>
                </div>
                <div className="bg-white rounded-lg p-4 border-3 border-green-500 text-center">
                  <div className="text-5xl font-black text-black">{timeUntilGame.hours}</div>
                  <div className="text-sm font-black text-gray-600 uppercase tracking-wide mt-1">Hours</div>
                </div>
                <div className="bg-white rounded-lg p-4 border-3 border-green-500 text-center">
                  <div className="text-5xl font-black text-black">{timeUntilGame.minutes}</div>
                  <div className="text-sm font-black text-gray-600 uppercase tracking-wide mt-1">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-4 border-3 border-green-500 text-center">
                  <div className="text-5xl font-black text-black">{timeUntilGame.seconds}</div>
                  <div className="text-sm font-black text-gray-600 uppercase tracking-wide mt-1">Seconds</div>
                </div>
              </div>

              {/* Game Details */}
              <div className="bg-white rounded-lg p-6 border-3 border-white mb-4">
                <div className="text-center">
                  <h3 className="text-3xl font-black text-black mb-3 uppercase">
                    TEXAS STARS vs {nextGame.opponent}
                  </h3>
                  <div className="flex items-center justify-center space-x-6 text-lg font-bold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{nextGame.isHome ? '🏠' : '✈️'}</span>
                      <span className="uppercase">{nextGame.isHome ? 'Home Game' : 'Away Game'}</span>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📍</span>
                      <span>{nextGame.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Betting Odds */}
              {nextGame.bettingOdds && (
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 border-4 border-yellow-300 shadow-xl">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-black text-black uppercase tracking-wide flex items-center justify-center gap-2">
                      <span className="text-3xl">💰</span>
                      BETTING ODDS
                      <span className="text-3xl">💰</span>
                    </h3>
                    <p className="text-sm font-bold text-black/70 mt-1">Latest lines and spreads</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Moneyline */}
                    <div className="bg-white rounded-lg p-4 border-3 border-black shadow-md">
                      <div className="text-center mb-3">
                        <div className="text-sm font-black text-gray-600 uppercase tracking-wide">Moneyline</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-green-50 rounded p-2 border-2 border-green-500">
                          <span className="font-black text-green-700 text-sm">STARS</span>
                          <span className="font-black text-black text-lg">{nextGame.bettingOdds.starsMoneyline}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 rounded p-2 border-2 border-gray-300">
                          <span className="font-bold text-gray-700 text-sm">{nextGame.opponent}</span>
                          <span className="font-black text-black text-lg">{nextGame.bettingOdds.opponentMoneyline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Over/Under */}
                    <div className="bg-white rounded-lg p-4 border-3 border-black shadow-md">
                      <div className="text-center mb-3">
                        <div className="text-sm font-black text-gray-600 uppercase tracking-wide">Over/Under</div>
                      </div>
                      <div className="flex items-center justify-center h-16">
                        <span className="font-black text-black text-3xl">{nextGame.bettingOdds.overUnder}</span>
                      </div>
                      <div className="text-center text-xs font-bold text-gray-500 mt-2">Total Goals</div>
                    </div>

                    {/* Puck Line */}
                    <div className="bg-white rounded-lg p-4 border-3 border-black shadow-md">
                      <div className="text-center mb-3">
                        <div className="text-sm font-black text-gray-600 uppercase tracking-wide">Puck Line</div>
                      </div>
                      <div className="flex items-center justify-center h-16">
                        <span className="font-black text-black text-3xl">{nextGame.bettingOdds.spread}</span>
                      </div>
                      <div className="text-center text-xs font-bold text-gray-500 mt-2">Spread</div>
                    </div>
                  </div>

                  <div className="text-center mt-4 text-xs font-bold text-black/60">
                    ⚠️ Please gamble responsibly • 21+ only
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border-4 border-black">
              <p className="text-gray-600 font-bold text-lg">No upcoming games scheduled</p>
            </div>
          )}

          {/* Headlines Section */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-4 border-black">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-4xl">📰</span>
              <h2 className="text-3xl font-black text-black uppercase tracking-wide">
                LATEST HEADLINES
              </h2>
            </div>

            {headlines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 font-bold text-lg">No headlines available</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for the latest news! ⭐</p>
              </div>
            ) : (
              <div className="space-y-4">
                {headlines.map((headline) => (
                  <div
                    key={headline.id}
                    className="bg-gray-50 rounded-lg p-5 border-3 border-gray-300 hover:border-green-600 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">⭐</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">
                          {headline.title}
                        </h3>
                        <p className="text-gray-700 font-medium leading-relaxed mb-3">
                          {headline.summary}
                        </p>
                        {headline.link && (
                          <a
                            href={headline.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-bold text-sm uppercase transition-colors"
                          >
                            <span>Read More</span>
                            <span>→</span>
                          </a>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {headline.createdAt?.toDate ? new Date(headline.createdAt.toDate()).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
