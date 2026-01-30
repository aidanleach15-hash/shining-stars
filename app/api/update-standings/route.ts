import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { awardAllPendingPredictions } from '@/lib/award-predictions';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // NHL 2025-26 Standings Data (Updated from HockeyDB - January 30, 2026)
    const completeStandings = [
      // ATLANTIC DIVISION
      { teamName: 'Tampa Bay Lightning', teamCode: 'TBL', division: 'Atlantic Division', gamesPlayed: 52, wins: 34, losses: 14, otLosses: 4, points: 72, goalsFor: 183, goalsAgainst: 131, goalDiff: 52, winPct: 0.692, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 1 },
      { teamName: 'Detroit Red Wings', teamCode: 'DET', division: 'Atlantic Division', gamesPlayed: 55, wins: 32, losses: 17, otLosses: 6, points: 70, goalsFor: 171, goalsAgainst: 166, goalDiff: 5, winPct: 0.636, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 2 },
      { teamName: 'Buffalo Sabres', teamCode: 'BUF', division: 'Atlantic Division', gamesPlayed: 53, wins: 31, losses: 17, otLosses: 5, points: 67, goalsFor: 183, goalsAgainst: 160, goalDiff: 23, winPct: 0.632, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 3 },
      { teamName: 'Boston Bruins', teamCode: 'BOS', division: 'Atlantic Division', gamesPlayed: 55, wins: 32, losses: 20, otLosses: 3, points: 67, goalsFor: 186, goalsAgainst: 171, goalDiff: 15, winPct: 0.609, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 4 },
      { teamName: 'Montreal Canadiens', teamCode: 'MTL', division: 'Atlantic Division', gamesPlayed: 54, wins: 30, losses: 17, otLosses: 7, points: 67, goalsFor: 187, goalsAgainst: 180, goalDiff: 7, winPct: 0.620, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 5 },
      { teamName: 'Florida Panthers', teamCode: 'FLA', division: 'Atlantic Division', gamesPlayed: 53, wins: 28, losses: 22, otLosses: 3, points: 59, goalsFor: 164, goalsAgainst: 174, goalDiff: -10, winPct: 0.557, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 6 },
      { teamName: 'Ottawa Senators', teamCode: 'OTT', division: 'Atlantic Division', gamesPlayed: 53, wins: 25, losses: 21, otLosses: 7, points: 57, goalsFor: 179, goalsAgainst: 176, goalDiff: 3, winPct: 0.538, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 7 },
      { teamName: 'Toronto Maple Leafs', teamCode: 'TOR', division: 'Atlantic Division', gamesPlayed: 54, wins: 24, losses: 21, otLosses: 9, points: 57, goalsFor: 176, goalsAgainst: 188, goalDiff: -12, winPct: 0.528, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 8 },

      // CENTRAL DIVISION
      { teamName: 'Colorado Avalanche', teamCode: 'COL', division: 'Central Division', gamesPlayed: 52, wins: 35, losses: 8, otLosses: 9, points: 79, goalsFor: 203, goalsAgainst: 134, goalDiff: 69, winPct: 0.760, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W4', rank: 1 },
      { teamName: 'Minnesota Wild', teamCode: 'MIN', division: 'Central Division', gamesPlayed: 55, wins: 31, losses: 14, otLosses: 10, points: 72, goalsFor: 179, goalsAgainst: 158, goalDiff: 21, winPct: 0.655, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 2 },
      { teamName: 'Dallas Stars', teamCode: 'DAL', division: 'Central Division', gamesPlayed: 54, wins: 31, losses: 14, otLosses: 9, points: 71, goalsFor: 181, goalsAgainst: 151, goalDiff: 30, winPct: 0.657, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W3', rank: 3 },
      { teamName: 'Utah Mammoth', teamCode: 'UTA', division: 'Central Division', gamesPlayed: 54, wins: 28, losses: 22, otLosses: 4, points: 60, goalsFor: 171, goalsAgainst: 151, goalDiff: 20, winPct: 0.556, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 4 },
      { teamName: 'Nashville Predators', teamCode: 'NSH', division: 'Central Division', gamesPlayed: 53, wins: 24, losses: 23, otLosses: 6, points: 54, goalsFor: 152, goalsAgainst: 180, goalDiff: -28, winPct: 0.509, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 5 },
      { teamName: 'Chicago Blackhawks', teamCode: 'CHI', division: 'Central Division', gamesPlayed: 54, wins: 21, losses: 24, otLosses: 9, points: 51, goalsFor: 146, goalsAgainst: 174, goalDiff: -28, winPct: 0.472, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 6 },
      { teamName: 'St. Louis Blues', teamCode: 'STL', division: 'Central Division', gamesPlayed: 54, wins: 20, losses: 25, otLosses: 9, points: 49, goalsFor: 135, goalsAgainst: 187, goalDiff: -52, winPct: 0.454, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L3', rank: 7 },
      { teamName: 'Winnipeg Jets', teamCode: 'WPG', division: 'Central Division', gamesPlayed: 53, wins: 21, losses: 25, otLosses: 7, points: 49, goalsFor: 154, goalsAgainst: 165, goalDiff: -11, winPct: 0.462, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 8 },

      // METROPOLITAN DIVISION
      { teamName: 'Carolina Hurricanes', teamCode: 'CAR', division: 'Metropolitan Division', gamesPlayed: 53, wins: 33, losses: 15, otLosses: 5, points: 71, goalsFor: 185, goalsAgainst: 154, goalDiff: 31, winPct: 0.670, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W3', rank: 1 },
      { teamName: 'Pittsburgh Penguins', teamCode: 'PIT', division: 'Metropolitan Division', gamesPlayed: 52, wins: 27, losses: 14, otLosses: 11, points: 65, goalsFor: 175, goalsAgainst: 154, goalDiff: 21, winPct: 0.625, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 2 },
      { teamName: 'New York Islanders', teamCode: 'NYI', division: 'Metropolitan Division', gamesPlayed: 54, wins: 30, losses: 19, otLosses: 5, points: 65, goalsFor: 157, goalsAgainst: 149, goalDiff: 8, winPct: 0.602, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 3 },
      { teamName: 'Washington Capitals', teamCode: 'WSH', division: 'Metropolitan Division', gamesPlayed: 55, wins: 26, losses: 22, otLosses: 7, points: 59, goalsFor: 175, goalsAgainst: 167, goalDiff: 8, winPct: 0.536, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 4 },
      { teamName: 'New Jersey Devils', teamCode: 'NJD', division: 'Metropolitan Division', gamesPlayed: 54, wins: 28, losses: 24, otLosses: 2, points: 58, goalsFor: 144, goalsAgainst: 165, goalDiff: -21, winPct: 0.537, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 5 },
      { teamName: 'Philadelphia Flyers', teamCode: 'PHI', division: 'Metropolitan Division', gamesPlayed: 53, wins: 24, losses: 20, otLosses: 9, points: 57, goalsFor: 160, goalsAgainst: 173, goalDiff: -13, winPct: 0.538, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 6 },
      { teamName: 'Columbus Blue Jackets', teamCode: 'CBJ', division: 'Metropolitan Division', gamesPlayed: 52, wins: 25, losses: 20, otLosses: 7, points: 57, goalsFor: 163, goalsAgainst: 172, goalDiff: -9, winPct: 0.548, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 7 },
      { teamName: 'New York Rangers', teamCode: 'NYR', division: 'Metropolitan Division', gamesPlayed: 55, wins: 22, losses: 27, otLosses: 6, points: 50, goalsFor: 146, goalsAgainst: 172, goalDiff: -26, winPct: 0.455, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 8 },

      // PACIFIC DIVISION
      { teamName: 'Vegas Golden Knights', teamCode: 'VGK', division: 'Pacific Division', gamesPlayed: 53, wins: 25, losses: 14, otLosses: 14, points: 64, goalsFor: 177, goalsAgainst: 169, goalDiff: 8, winPct: 0.604, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 1 },
      { teamName: 'Edmonton Oilers', teamCode: 'EDM', division: 'Pacific Division', gamesPlayed: 55, wins: 28, losses: 19, otLosses: 8, points: 64, goalsFor: 190, goalsAgainst: 178, goalDiff: 12, winPct: 0.582, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 2 },
      { teamName: 'Anaheim Ducks', teamCode: 'ANA', division: 'Pacific Division', gamesPlayed: 54, wins: 28, losses: 23, otLosses: 3, points: 59, goalsFor: 177, goalsAgainst: 190, goalDiff: -13, winPct: 0.546, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 3 },
      { teamName: 'Seattle Kraken', teamCode: 'SEA', division: 'Pacific Division', gamesPlayed: 53, wins: 25, losses: 19, otLosses: 9, points: 59, goalsFor: 153, goalsAgainst: 157, goalDiff: -4, winPct: 0.557, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 4 },
      { teamName: 'San Jose Sharks', teamCode: 'SJS', division: 'Pacific Division', gamesPlayed: 52, wins: 27, losses: 21, otLosses: 4, points: 58, goalsFor: 164, goalsAgainst: 180, goalDiff: -16, winPct: 0.558, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 5 },
      { teamName: 'Los Angeles Kings', teamCode: 'LAK', division: 'Pacific Division', gamesPlayed: 52, wins: 22, losses: 17, otLosses: 13, points: 57, goalsFor: 138, goalsAgainst: 148, goalDiff: -10, winPct: 0.548, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 6 },
      { teamName: 'Calgary Flames', teamCode: 'CGY', division: 'Pacific Division', gamesPlayed: 53, wins: 21, losses: 26, otLosses: 6, points: 48, goalsFor: 133, goalsAgainst: 160, goalDiff: -27, winPct: 0.453, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L3', rank: 7 },
      { teamName: 'Vancouver Canucks', teamCode: 'VAN', division: 'Pacific Division', gamesPlayed: 54, wins: 18, losses: 31, otLosses: 5, points: 41, goalsFor: 143, goalsAgainst: 196, goalDiff: -53, winPct: 0.380, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L5', rank: 8 },
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

    // Award predictions for any newly finalized games
    const awardResult = await awardAllPendingPredictions();

    return NextResponse.json({
      success: true,
      message: `Updated standings with ${completeStandings.length} teams (as of Jan 28, 2026). Awarded ${awardResult.totalAwarded || 0} predictions.`,
      teamsAdded: completeStandings.length,
      predictionsAwarded: awardResult.totalAwarded || 0
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
