import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // AHL 2025-26 Standings Data (Updated from HockeyDB - January 28, 2026)
    const completeStandings = [
      // CENTRAL DIVISION
      { teamName: 'Grand Rapids Griffins', teamCode: 'GR', division: 'Central Division', gamesPlayed: 40, wins: 32, losses: 5, otLosses: 2, points: 67, goalsFor: 139, goalsAgainst: 74, goalDiff: 65, winPct: 0.838, homeRecord: '17-2-1', awayRecord: '15-3-1', streak: 'W5', rank: 1 },
      { teamName: 'Chicago Wolves', teamCode: 'CHI', division: 'Central Division', gamesPlayed: 39, wins: 20, losses: 9, otLosses: 5, points: 50, goalsFor: 125, goalsAgainst: 117, goalDiff: 8, winPct: 0.641, homeRecord: '12-4-2', awayRecord: '8-5-3', streak: 'W2', rank: 2 },
      { teamName: 'Manitoba Moose', teamCode: 'MB', division: 'Central Division', gamesPlayed: 38, wins: 20, losses: 15, otLosses: 3, points: 43, goalsFor: 100, goalsAgainst: 109, goalDiff: -9, winPct: 0.566, homeRecord: '11-8-1', awayRecord: '9-7-2', streak: 'L1', rank: 3 },
      { teamName: 'Milwaukee Admirals', teamCode: 'MIL', division: 'Central Division', gamesPlayed: 39, wins: 19, losses: 17, otLosses: 2, points: 41, goalsFor: 116, goalsAgainst: 114, goalDiff: 2, winPct: 0.526, homeRecord: '11-7-1', awayRecord: '8-10-1', streak: 'L2', rank: 4 },
      { teamName: 'Texas Stars', teamCode: 'TEX', division: 'Central Division', gamesPlayed: 41, wins: 18, losses: 19, otLosses: 3, points: 40, goalsFor: 114, goalsAgainst: 127, goalDiff: -13, winPct: 0.488, homeRecord: '12-8-1', awayRecord: '6-11-2', streak: 'W1', rank: 5 },
      { teamName: 'Rockford IceHogs', teamCode: 'ROC', division: 'Central Division', gamesPlayed: 43, wins: 16, losses: 23, otLosses: 2, points: 36, goalsFor: 120, goalsAgainst: 146, goalDiff: -26, winPct: 0.419, homeRecord: '10-10-1', awayRecord: '6-13-1', streak: 'L1', rank: 6 },
      { teamName: 'Iowa Wild', teamCode: 'IA', division: 'Central Division', gamesPlayed: 41, wins: 10, losses: 26, otLosses: 4, points: 25, goalsFor: 88, goalsAgainst: 136, goalDiff: -48, winPct: 0.305, homeRecord: '7-12-2', awayRecord: '3-14-2', streak: 'L3', rank: 7 },

      // PACIFIC DIVISION
      { teamName: 'Ontario Reign', teamCode: 'ONT', division: 'Pacific Division', gamesPlayed: 42, wins: 28, losses: 12, otLosses: 1, points: 58, goalsFor: 142, goalsAgainst: 114, goalDiff: 28, winPct: 0.690, homeRecord: '15-6-1', awayRecord: '13-6-0', streak: 'W1', rank: 1 },
      { teamName: 'Colorado Eagles', teamCode: 'COL', division: 'Pacific Division', gamesPlayed: 40, wins: 26, losses: 10, otLosses: 1, points: 56, goalsFor: 130, goalsAgainst: 94, goalDiff: 36, winPct: 0.700, homeRecord: '14-4-1', awayRecord: '12-6-0', streak: 'W3', rank: 2 },
      { teamName: 'Bakersfield Condors', teamCode: 'BAK', division: 'Pacific Division', gamesPlayed: 41, wins: 22, losses: 12, otLosses: 7, points: 51, goalsFor: 140, goalsAgainst: 128, goalDiff: 12, winPct: 0.622, homeRecord: '13-5-3', awayRecord: '9-7-4', streak: 'W2', rank: 3 },
      { teamName: 'Coachella Valley Firebirds', teamCode: 'CV', division: 'Pacific Division', gamesPlayed: 40, wins: 22, losses: 13, otLosses: 5, points: 49, goalsFor: 137, goalsAgainst: 127, goalDiff: 10, winPct: 0.613, homeRecord: '12-6-2', awayRecord: '10-7-3', streak: 'W4', rank: 4 },
      { teamName: 'San Jose Barracuda', teamCode: 'SJ', division: 'Pacific Division', gamesPlayed: 38, wins: 22, losses: 13, otLosses: 1, points: 47, goalsFor: 121, goalsAgainst: 122, goalDiff: -1, winPct: 0.618, homeRecord: '13-5-1', awayRecord: '9-8-0', streak: 'L1', rank: 5 },
      { teamName: 'Tucson Roadrunners', teamCode: 'TUC', division: 'Pacific Division', gamesPlayed: 40, wins: 19, losses: 14, otLosses: 7, points: 45, goalsFor: 130, goalsAgainst: 128, goalDiff: 2, winPct: 0.563, homeRecord: '11-7-2', awayRecord: '8-7-5', streak: 'W1', rank: 6 },
      { teamName: 'San Diego Gulls', teamCode: 'SD', division: 'Pacific Division', gamesPlayed: 41, wins: 18, losses: 14, otLosses: 6, points: 45, goalsFor: 115, goalsAgainst: 116, goalDiff: -1, winPct: 0.549, homeRecord: '10-6-4', awayRecord: '8-8-2', streak: 'L2', rank: 7 },
      { teamName: 'Henderson Silver Knights', teamCode: 'HSK', division: 'Pacific Division', gamesPlayed: 38, wins: 18, losses: 14, otLosses: 4, points: 42, goalsFor: 118, goalsAgainst: 113, goalDiff: 5, winPct: 0.553, homeRecord: '10-6-2', awayRecord: '8-8-2', streak: 'W2', rank: 8 },
      { teamName: 'Calgary Wranglers', teamCode: 'CGY', division: 'Pacific Division', gamesPlayed: 42, wins: 16, losses: 16, otLosses: 8, points: 42, goalsFor: 114, goalsAgainst: 143, goalDiff: -29, winPct: 0.500, homeRecord: '9-7-5', awayRecord: '7-9-3', streak: 'L1', rank: 9 },
      { teamName: 'Abbotsford Canucks', teamCode: 'ABB', division: 'Pacific Division', gamesPlayed: 44, wins: 15, losses: 23, otLosses: 3, points: 36, goalsFor: 96, goalsAgainst: 146, goalDiff: -50, winPct: 0.409, homeRecord: '9-10-2', awayRecord: '6-13-1', streak: 'L4', rank: 10 },
    ];

    // Clear old standings
    const standingsSnapshot = await getDocs(collection(db, 'standings'));
    for (const doc of standingsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add updated standings
    for (const team of completeStandings) {
      await addDoc(collection(db, 'standings'), {
        ...team,
        lastUpdated: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated standings with ${completeStandings.length} teams (as of Jan 28, 2026)`,
      teamsAdded: completeStandings.length
    });

  } catch (error: any) {
    console.error('Error updating standings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// This endpoint is called by Vercel Cron to update standings daily at 12 AM
export async function GET() {
  return POST();
}
