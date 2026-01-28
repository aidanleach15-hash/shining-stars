import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function POST() {
  try {
    // Fetch live game data from AHL website
    const response = await fetch('https://theahl.com/stats/schedule/188/32', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();

    // Parse the live game data for Texas Stars
    const gameData = parseTexasStarsGame(html);

    if (!gameData) {
      return NextResponse.json({
        success: true,
        message: 'No live Texas Stars game found'
      });
    }

    // Clear existing live game data
    const gameQuery = query(collection(db, 'liveGame'));
    const gameSnapshot = await getDocs(gameQuery);
    for (const doc of gameSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new live game data
    await addDoc(collection(db, 'liveGame'), {
      ...gameData,
      timestamp: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Live game data updated',
      data: gameData
    });
  } catch (error: any) {
    console.error('Error fetching live game:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function parseTexasStarsGame(html: string) {
  try {
    // Look for Texas Stars in the schedule
    const texasStarsMatch = html.match(/Texas Stars/i);
    if (!texasStarsMatch) {
      return null;
    }

    // Extract game information
    // This is a simplified parser - we'll enhance it based on actual HTML structure
    const scorePattern = /(\d+)\s*-\s*(\d+)/;
    const periodPattern = /(1st|2nd|3rd|OT|SO)\s*Period/i;
    const timePattern = /(\d{1,2}:\d{2})/;

    // Check if game is live (contains "Live", "In Progress", or current period)
    const isLive = /live|in progress|1st period|2nd period|3rd period/i.test(html);

    if (!isLive) {
      return null;
    }

    // Parse basic game data
    // Note: This is a basic implementation. We'll need to adjust based on actual AHL website structure
    const gameData = {
      homeTeam: 'Texas Stars',
      awayTeam: extractOpponent(html),
      homeScore: 0,
      awayScore: 0,
      period: '1st Period',
      timeRemaining: '20:00',
      homeShotsOnGoal: 0,
      awayShotsOnGoal: 0,
      isLive: true,
      gameStatus: 'In Progress'
    };

    return gameData;
  } catch (error) {
    console.error('Error parsing game data:', error);
    return null;
  }
}

function extractOpponent(html: string): string {
  // Extract opponent team name
  // This will need to be adjusted based on actual HTML structure
  const teamPattern = /vs\s+([A-Za-z\s]+)|@\s+([A-Za-z\s]+)/i;
  const match = html.match(teamPattern);
  return match ? (match[1] || match[2] || 'Opponent').trim() : 'Opponent';
}

// Export for GET requests too (for manual testing)
export async function GET() {
  return POST();
}
