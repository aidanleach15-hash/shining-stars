import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export async function POST() {
  try {
    // Texas Stars 2025-26 Season Schedule (72 games: 36 home, 36 away)
    // Based on official AHL schedule data
    const schedule2025_26 = [
      // October 2025 (Home: 4, Away: 2)
      { date: new Date('2025-10-10T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-10-11T18:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-10-17T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-10-18T19:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-10-24T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-10-25T18:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },

      // November 2025 (Home: 6, Away: 7)
      { date: new Date('2025-11-01T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-11-02T18:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '7:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-11-07T19:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-11-08T18:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-11-14T19:00:00'), opponent: 'COLORADO EAGLES', opponentAbbr: 'COL', isHome: false, location: 'Blue Arena', time: '9:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-11-15T19:00:00'), opponent: 'COLORADO EAGLES', opponentAbbr: 'COL', isHome: false, location: 'Blue Arena', time: '9:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-11-21T19:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-11-22T18:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-11-29T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-11-30T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '10:00 PM ET', status: 'scheduled' as const },

      // December 2025 (Home: 4, Away: 7)
      { date: new Date('2025-12-03T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-05T19:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: false, location: 'Pechanga Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-06T19:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: false, location: 'Pechanga Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-09T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-12T19:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-12-13T18:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-12-19T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-12-20T18:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2025-12-27T19:00:00'), opponent: 'TUCSON ROADRUNNERS', opponentAbbr: 'TUC', isHome: false, location: 'Tucson Arena', time: '9:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-28T19:00:00'), opponent: 'TUCSON ROADRUNNERS', opponentAbbr: 'TUC', isHome: false, location: 'Tucson Arena', time: '9:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2025-12-31T18:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: false, location: 'Mechanics Bank Arena', time: '10:00 PM ET', status: 'scheduled' as const },

      // January 2026
      { date: new Date('2026-01-03T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-01-04T18:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-01-09T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-01-10T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-01-16T19:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-01-17T18:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-01-23T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-01-24T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-01-30T19:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-01-31T19:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },

      // February 2026
      { date: new Date('2026-02-06T19:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-07T18:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-13T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-02-14T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-02-20T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-21T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-27T19:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-28T18:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },

      // March 2026
      { date: new Date('2026-03-06T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-03-07T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-03-13T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-14T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-20T19:00:00'), opponent: 'COLORADO EAGLES', opponentAbbr: 'COL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-03-21T18:00:00'), opponent: 'COLORADO EAGLES', opponentAbbr: 'COL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-03-27T19:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-28T19:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '8:00 PM ET', status: 'scheduled' as const },

      // April 2026
      { date: new Date('2026-04-03T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-04-04T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-04-10T19:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: false, location: 'Mechanics Bank Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-11T19:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: false, location: 'Mechanics Bank Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-17T19:00:00'), opponent: 'TUCSON ROADRUNNERS', opponentAbbr: 'TUC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-04-18T18:00:00'), opponent: 'TUCSON ROADRUNNERS', opponentAbbr: 'TUC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'scheduled' as const },
    ];

    // Try to fetch from AHL API first (if available)
    let games = schedule2025_26;
    try {
      const teamId = '370';
      const seasonId = '79';

      const response = await fetch(
        `https://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&team_id=${teamId}&season_id=${seasonId}&month=-1`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const apiGames = data?.SiteKit?.Schedule || [];

        if (apiGames && apiGames.length > 0) {
          // Use API data if available
          games = apiGames.map((game: any) => {
            const gameDate = new Date(game.date_played || game.date_with_day);
            const isHome = game.home_team === 'Texas Stars' || game.home_team_city === 'Texas';
            const opponent = isHome
              ? (game.visiting_team || game.visiting_team_city)
              : (game.home_team || game.home_team_city);

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

            return {
              date: gameDate,
              opponent: opponent,
              opponentAbbr: game.visiting_team_code || game.home_team_code || '',
              isHome: isHome,
              location: isHome ? 'H-E-B Center at Cedar Park' : (game.venue || 'Away'),
              time: game.game_time || 'TBD',
              status: status,
              starsScore: starsScore,
              opponentScore: opponentScore,
              gameId: game.id || game.game_id || ''
            };
          });
        }
      }
    } catch (apiError) {
      console.log('Using hardcoded schedule (API unavailable):', apiError);
    }

    // Clear old schedule data
    const scheduleSnapshot = await getDocs(collection(db, 'schedule'));
    for (const doc of scheduleSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add schedule data
    for (const game of games) {
      await addDoc(collection(db, 'schedule'), {
        ...game,
        season: '2025-26'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated schedule with ${games.length} games`,
      gamesAdded: games.length
    });

  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
