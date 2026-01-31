import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { awardAllPendingPredictions } from '@/lib/award-predictions';

export async function POST() {
  try {
    // Texas Stars 2025-26 Complete Season Schedule with Real Results
    // Data from OurSports Central (updated through January 23, 2026)
    const completeSchedule = [
      // OCTOBER 2025 - COMPLETED GAMES
      { date: new Date('2025-10-10T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 4 },
      { date: new Date('2025-10-11T18:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 3 },
      { date: new Date('2025-10-17T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '7:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 2 },
      { date: new Date('2025-10-18T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 5 },
      { date: new Date('2025-10-24T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 3 },
      { date: new Date('2025-10-25T18:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 0, opponentScore: 2 },

      // NOVEMBER 2025 - COMPLETED GAMES
      { date: new Date('2025-11-02T19:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: false, location: 'Canada Life Centre', time: '7:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 1 },
      { date: new Date('2025-11-03T19:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: false, location: 'Canada Life Centre', time: '2:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 0 },
      { date: new Date('2025-11-07T19:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 4, opponentScore: 1 },
      { date: new Date('2025-11-08T18:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 3 },
      { date: new Date('2025-11-15T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 3 },
      { date: new Date('2025-11-16T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 2 },
      { date: new Date('2025-11-18T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 3 },
      { date: new Date('2025-11-21T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 4 },
      { date: new Date('2025-11-22T18:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 5, opponentScore: 2 },
      { date: new Date('2025-11-25T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'final' as const, starsScore: 1, opponentScore: 10 },
      { date: new Date('2025-11-26T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'final' as const, starsScore: 3, opponentScore: 6 },
      { date: new Date('2025-11-29T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 5, opponentScore: 3 },
      { date: new Date('2025-11-30T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 4, opponentScore: 1 },

      // DECEMBER 2025 - COMPLETED GAMES
      { date: new Date('2025-12-03T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 3 },
      { date: new Date('2025-12-05T19:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: false, location: 'Pechanga Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 2 },
      { date: new Date('2025-12-07T19:00:00'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: false, location: 'Pechanga Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 5 },
      { date: new Date('2025-12-09T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 6 },
      { date: new Date('2025-12-12T19:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 3 },
      { date: new Date('2025-12-13T18:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 4 },
      { date: new Date('2025-12-19T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 2 },
      { date: new Date('2025-12-20T18:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 5, opponentScore: 2 },
      { date: new Date('2025-12-27T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '7:00 PM CT', status: 'final' as const, starsScore: 4, opponentScore: 8 },
      { date: new Date('2025-12-30T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 1, opponentScore: 4 },
      { date: new Date('2025-12-31T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 2 },

      // JANUARY 2026 - COMPLETED GAMES (through Jan 23)
      { date: new Date('2026-01-03T19:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'final' as const, starsScore: 4, opponentScore: 3 },
      { date: new Date('2026-01-04T18:00:00'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: true, location: 'H-E-B Center at Cedar Park', time: '6:00 PM CT', status: 'final' as const, starsScore: 4, opponentScore: 1 },
      { date: new Date('2026-01-07T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'final' as const, starsScore: 2, opponentScore: 3 },
      { date: new Date('2026-01-09T19:00:00'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'final' as const, starsScore: 2, opponentScore: 0 },
      { date: new Date('2026-01-10T19:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 1 },
      { date: new Date('2026-01-13T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 2, opponentScore: 5 },
      { date: new Date('2026-01-14T19:00:00'), opponent: 'COACHELLA VALLEY FIREBIRDS', opponentAbbr: 'CV', isHome: false, location: 'Acrisure Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 6 },
      { date: new Date('2026-01-17T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 4 },
      { date: new Date('2026-01-18T19:00:00'), opponent: 'ONTARIO REIGN', opponentAbbr: 'ONT', isHome: false, location: 'Toyota Arena', time: '9:00 PM CT', status: 'final' as const, starsScore: 3, opponentScore: 1 },
      { date: new Date('2026-01-21T19:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: false, location: 'Wells Fargo Arena', time: '7:00 PM CT', status: 'final' as const, starsScore: 6, opponentScore: 4 },
      { date: new Date('2026-01-23T19:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: false, location: 'BMO Center', time: '7:00 PM CT', status: 'final' as const, starsScore: 5, opponentScore: 0 },

      // JANUARY 2026 - UPCOMING GAMES (Using exact AHL API times in ISO8601 format)
      { date: new Date('2026-01-31T19:00:00-06:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-01T19:00:00-06:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },

      // FEBRUARY 2026
      { date: new Date('2026-02-07T01:00:00Z'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-08T01:00:00Z'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-14T00:00:00Z'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '7:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-02-15T21:00:00Z'), opponent: 'GRAND RAPIDS GRIFFINS', opponentAbbr: 'GR', isHome: false, location: 'Van Andel Arena', time: '4:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-02-19T01:00:00Z'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-21T01:00:00Z'), opponent: 'MILWAUKEE ADMIRALS', opponentAbbr: 'MIL', isHome: false, location: 'UW-Milwaukee Panther Arena', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-22T01:00:00Z'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-02-28T01:00:00Z'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },
      { date: new Date('2026-03-01T01:00:00Z'), opponent: 'SAN DIEGO GULLS', opponentAbbr: 'SD', isHome: true, location: 'H-E-B Center at Cedar Park', time: '7:00 PM CT', status: 'scheduled' as const },

      // MARCH 2026
      { date: new Date('2026-03-07T20:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-08T16:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: false, location: 'Allstate Arena', time: '4:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-13T20:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-14T20:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-17T20:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-18T20:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-21T21:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: false, location: 'Dollar Loan Center', time: '9:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-22T20:00:00'), opponent: 'HENDERSON SILVER KNIGHTS', opponentAbbr: 'HSK', isHome: false, location: 'Dollar Loan Center', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-25T22:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: false, location: 'Tech CU Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-27T22:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: false, location: 'Mechanics Bank Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-28T22:00:00'), opponent: 'BAKERSFIELD CONDORS', opponentAbbr: 'BAK', isHome: false, location: 'Mechanics Bank Arena', time: '10:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-03-31T22:00:00'), opponent: 'SAN JOSE BARRACUDA', opponentAbbr: 'SJ', isHome: false, location: 'Tech CU Arena', time: '10:00 PM ET', status: 'scheduled' as const },

      // APRIL 2026
      { date: new Date('2026-04-03T20:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-04T20:00:00'), opponent: 'CHICAGO WOLVES', opponentAbbr: 'CHI', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-07T20:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-08T20:00:00'), opponent: 'IOWA WILD', opponentAbbr: 'IA', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-10T20:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: false, location: 'Canada Life Centre', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-12T15:00:00'), opponent: 'MANITOBA MOOSE', opponentAbbr: 'MB', isHome: false, location: 'Canada Life Centre', time: '3:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-17T20:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
      { date: new Date('2026-04-18T20:00:00'), opponent: 'ROCKFORD ICEHOGS', opponentAbbr: 'ROC', isHome: true, location: 'H-E-B Center at Cedar Park', time: '8:00 PM ET', status: 'scheduled' as const },
    ];

    // Clear old schedule data
    const scheduleSnapshot = await getDocs(collection(db, 'schedule'));
    for (const doc of scheduleSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add complete schedule data
    for (const game of completeSchedule) {
      await addDoc(collection(db, 'schedule'), {
        ...game,
        season: '2025-26'
      });
    }

    // Award predictions for any newly finalized games
    const awardResult = await awardAllPendingPredictions();

    return NextResponse.json({
      success: true,
      message: `Updated schedule with ${completeSchedule.length} games (${completeSchedule.filter(g => g.status === 'final').length} completed, ${completeSchedule.filter(g => g.status === 'scheduled').length} upcoming). Awarded ${awardResult.totalAwarded || 0} predictions.`,
      gamesAdded: completeSchedule.length,
      predictionsAwarded: awardResult.totalAwarded || 0
    });

  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
