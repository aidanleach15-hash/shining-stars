import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Try to fetch from AHL API/website
    let gameData = null;

    // Method 1: Try AHL Stats API
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`https://lscluster.hockeytech.com/feed/?feed=modulekit&view=scorebar&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&league_code=&fmt=json&date=${today}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const data = await response.json();
      gameData = findTexasStarsGame(data);
    } catch (error) {
      console.log('AHL API method failed, trying alternative...');
    }

    // Method 2: Fallback - check if there's a scheduled game today
    if (!gameData) {
      // Check our games collection to see if there's a game today
      const gamesQuery = query(collection(db, 'games'));
      const gamesSnapshot = await getDocs(gamesQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysGame = gamesSnapshot.docs.find(doc => {
        const gameDate = doc.data().date?.toDate();
        return gameDate >= today && gameDate < tomorrow;
      });

      if (todaysGame) {
        const game = todaysGame.data();
        gameData = {
          homeTeam: game.isHome ? 'Texas Stars' : game.opponent,
          awayTeam: game.isHome ? game.opponent : 'Texas Stars',
          homeScore: 0,
          awayScore: 0,
          period: 'Pregame',
          timeRemaining: '',
          homeShotsOnGoal: 0,
          awayShotsOnGoal: 0,
          isLive: false,
          gameStatus: 'Scheduled'
        };
      }
    }

    if (!gameData) {
      // No game found - clear any existing live game
      const gameQuery = query(collection(db, 'liveGame'));
      const gameSnapshot = await getDocs(gameQuery);
      for (const doc of gameSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      return NextResponse.json({
        success: true,
        message: 'No Texas Stars game today'
      });
    }

    // Update the database
    const gameQuery = query(collection(db, 'liveGame'));
    const gameSnapshot = await getDocs(gameQuery);
    for (const doc of gameSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    await addDoc(collection(db, 'liveGame'), {
      ...gameData,
      timestamp: serverTimestamp(),
      lastUpdated: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Live game data updated',
      data: gameData
    });
  } catch (error: any) {
    console.error('Error auto-updating live game:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function findTexasStarsGame(data: any) {
  try {
    if (!data || !data.SiteKit || !data.SiteKit.Scorebar) {
      return null;
    }

    const games = data.SiteKit.Scorebar;

    // Find Texas Stars game
    for (const game of games) {
      const homeTeam = game.home_team_name || '';
      const awayTeam = game.visiting_team_name || '';

      if (homeTeam.includes('Texas Stars') || awayTeam.includes('Texas Stars')) {
        const isTexasHome = homeTeam.includes('Texas Stars');
        const gameStatus = game.game_status || '';
        const isLive = gameStatus === 'In Progress' || gameStatus === 'Live';

        return {
          homeTeam: isTexasHome ? 'Texas Stars' : awayTeam,
          awayTeam: isTexasHome ? awayTeam : 'Texas Stars',
          homeScore: parseInt(game.home_goal_count) || 0,
          awayScore: parseInt(game.visiting_goal_count) || 0,
          period: parsePeriod(game.period || '1'),
          timeRemaining: game.time_remaining || '20:00',
          homeShotsOnGoal: parseInt(game.home_shots) || 0,
          awayShotsOnGoal: parseInt(game.visiting_shots) || 0,
          isLive: isLive,
          gameStatus: gameStatus
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing game data:', error);
    return null;
  }
}

function parsePeriod(period: string): string {
  const periodNum = parseInt(period);
  if (periodNum === 1) return '1st Period';
  if (periodNum === 2) return '2nd Period';
  if (periodNum === 3) return '3rd Period';
  if (periodNum === 4) return 'OT';
  if (periodNum === 5) return 'SO';
  return period;
}
