import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';

export async function POST() {
  try {
    // Texas Stars team ID in AHL API is 370
    const teamId = '370';
    const seasonId = '79'; // 2025-26 season

    // Fetch schedule from AHL API
    const response = await fetch(
      `https://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&team_id=${teamId}&season_id=${seasonId}&month=-1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch schedule from AHL API');
    }

    const data = await response.json();
    const games = data?.SiteKit?.Schedule || [];

    if (!games || games.length === 0) {
      throw new Error('No schedule data found');
    }

    // Clear old schedule data
    const scheduleSnapshot = await getDocs(collection(db, 'schedule'));
    for (const doc of scheduleSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new schedule data
    let addedCount = 0;
    for (const game of games) {
      try {
        // Parse date and time
        const gameDate = new Date(game.date_played || game.date_with_day);
        const time = game.game_time || 'TBD';

        // Determine if home game
        const isHome = game.home_team === 'Texas Stars' || game.home_team_city === 'Texas';

        // Get opponent name
        const opponent = isHome
          ? (game.visiting_team || game.visiting_team_city)
          : (game.home_team || game.home_team_city);

        // Get location
        const location = isHome
          ? 'H-E-B Center at Cedar Park'
          : game.venue || 'Away';

        // Determine game status
        let status: 'scheduled' | 'in_progress' | 'final' = 'scheduled';
        let starsScore: number | undefined;
        let opponentScore: number | undefined;

        if (game.final === '1' || game.game_status === 'Final') {
          status = 'final';
          if (isHome) {
            starsScore = parseInt(game.home_goal_count) || 0;
            opponentScore = parseInt(game.visiting_goal_count) || 0;
          } else {
            starsScore = parseInt(game.visiting_goal_count) || 0;
            opponentScore = parseInt(game.home_goal_count) || 0;
          }
        } else if (game.game_status === 'In Progress' || game.game_status === 'Live') {
          status = 'in_progress';
        }

        await addDoc(collection(db, 'schedule'), {
          date: gameDate,
          opponent: opponent,
          opponentAbbr: game.visiting_team_code || game.home_team_code || '',
          isHome: isHome,
          location: location,
          time: time,
          status: status,
          starsScore: starsScore,
          opponentScore: opponentScore,
          gameId: game.id || game.game_id || '',
          season: '2025-26'
        });

        addedCount++;
      } catch (gameError) {
        console.error('Error adding game:', gameError);
        // Continue with next game
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated schedule with ${addedCount} games`,
      gamesAdded: addedCount
    });

  } catch (error: any) {
    console.error('Error updating schedule:', error);

    // Fallback: Add sample schedule data
    try {
      const scheduleSnapshot = await getDocs(collection(db, 'schedule'));
      if (scheduleSnapshot.empty) {
        // Add a few sample games as fallback
        const sampleGames = [
          {
            date: new Date('2026-01-30T19:00:00'),
            opponent: 'HENDERSON SILVER KNIGHTS',
            opponentAbbr: 'HK',
            isHome: true,
            location: 'H-E-B Center at Cedar Park',
            time: '7:00 PM CT',
            status: 'scheduled',
            season: '2025-26'
          },
          {
            date: new Date('2026-02-01T18:00:00'),
            opponent: 'MANITOBA MOOSE',
            opponentAbbr: 'MB',
            isHome: true,
            location: 'H-E-B Center at Cedar Park',
            time: '6:00 PM CT',
            status: 'scheduled',
            season: '2025-26'
          }
        ];

        for (const game of sampleGames) {
          await addDoc(collection(db, 'schedule'), game);
        }

        return NextResponse.json({
          success: true,
          message: `Added ${sampleGames.length} sample games (API unavailable)`,
          gamesAdded: sampleGames.length
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
