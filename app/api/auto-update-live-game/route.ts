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

      if (homeTeam.includes('Texas') || awayTeam.includes('Texas')) {
        const isTexasHome = homeTeam.includes('Texas');
        const gameStatus = game.game_status || game.status || '';

        // Detect if game is live - check multiple status indicators
        const isLive =
          gameStatus.toLowerCase().includes('in progress') ||
          gameStatus.toLowerCase().includes('live') ||
          gameStatus === 'InProgress' ||
          gameStatus === '2' || // AHL API uses numeric codes
          (game.period && parseInt(game.period) > 0 && parseInt(game.period) <= 5 && gameStatus !== 'Final');

        // Parse period more accurately
        let period = parsePeriod(game.period || game.current_period || '0');
        if (gameStatus.toLowerCase().includes('final')) {
          period = 'Final';
        } else if (gameStatus.toLowerCase().includes('pregame')) {
          period = 'Pregame';
        } else if (!period || period === '0') {
          period = gameStatus || 'Scheduled';
        }

        // Get time remaining - handle different formats
        let timeRemaining = game.time_remaining || game.clock || '';
        if (!timeRemaining && period !== 'Final' && period !== 'Pregame') {
          timeRemaining = '20:00';
        }

        return {
          homeTeam: isTexasHome ? 'Texas Stars' : (awayTeam || 'Opponent'),
          awayTeam: isTexasHome ? (awayTeam || 'Opponent') : 'Texas Stars',
          homeScore: parseInt(game.home_goal_count || game.home_score || 0),
          awayScore: parseInt(game.visiting_goal_count || game.visitor_score || game.away_score || 0),
          period: period,
          timeRemaining: timeRemaining,
          homeShotsOnGoal: parseInt(game.home_shots || game.home_sog || 0),
          awayShotsOnGoal: parseInt(game.visiting_shots || game.visitor_sog || game.away_sog || 0),
          isLive: isLive,
          gameStatus: gameStatus || 'Unknown'
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
  if (!period) return '';

  const periodStr = period.toLowerCase();

  // Check for text periods first
  if (periodStr.includes('1st') || periodStr === '1') return '1st Period';
  if (periodStr.includes('2nd') || periodStr === '2') return '2nd Period';
  if (periodStr.includes('3rd') || periodStr === '3') return '3rd Period';
  if (periodStr.includes('ot') || periodStr === '4' || periodStr.includes('overtime')) return 'Overtime';
  if (periodStr.includes('so') || periodStr === '5' || periodStr.includes('shootout')) return 'Shootout';
  if (periodStr.includes('final')) return 'Final';
  if (periodStr.includes('pregame') || periodStr === '0') return 'Pregame';

  // Try to parse as number
  const periodNum = parseInt(period);
  if (!isNaN(periodNum)) {
    if (periodNum === 1) return '1st Period';
    if (periodNum === 2) return '2nd Period';
    if (periodNum === 3) return '3rd Period';
    if (periodNum === 4) return 'Overtime';
    if (periodNum === 5) return 'Shootout';
  }

  return period;
}
