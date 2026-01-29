import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function GET() {
  try {
    // Get Texas Stars team stats from Firebase (already updated by update-team-stats)
    const teamStatsQuery = query(collection(db, 'teamStats'));
    const teamStatsSnapshot = await getDocs(teamStatsQuery);

    let starsWinPct = 0.500;
    let starsAvgGoalsFor = 2.8;
    let starsAvgGoalsAgainst = 2.8;

    if (!teamStatsSnapshot.empty) {
      const teamData = teamStatsSnapshot.docs[0].data();

      // Parse record (format: "16-19-5-1")
      const recordParts = teamData.record?.split('-') || [];
      if (recordParts.length >= 3) {
        const wins = parseInt(recordParts[0]) || 0;
        const losses = parseInt(recordParts[1]) || 0;
        const otLosses = parseInt(recordParts[2]) || 0;
        const totalGames = wins + losses + otLosses;

        if (totalGames > 0) {
          // OT losses count as 0.5 wins for win percentage
          starsWinPct = (wins + (otLosses * 0.5)) / totalGames;
        }
      }

      // Use goals for/against if available
      if (teamData.goalsFor && teamData.goalsAgainst) {
        const gamesPlayed = teamData.gamesPlayed || 41;
        starsAvgGoalsFor = teamData.goalsFor / gamesPlayed;
        starsAvgGoalsAgainst = teamData.goalsAgainst / gamesPlayed;
      }
    }

    console.log('Stars Stats - Win%:', starsWinPct.toFixed(3), 'GF/G:', starsAvgGoalsFor.toFixed(2), 'GA/G:', starsAvgGoalsAgainst.toFixed(2));

    // Fetch all upcoming games from Firebase
    const gamesQuery = query(collection(db, 'games'));
    const gamesSnapshot = await getDocs(gamesQuery);

    let updatedCount = 0;

    for (const gameDoc of gamesSnapshot.docs) {
      const game = gameDoc.data();

      // Estimate opponent stats based on typical AHL team averages
      // In reality, most AHL teams are close to .500 with ~2.8 goals/game
      const oppWinPct = 0.485; // Slightly below .500 as average
      const oppAvgGoalsFor = 2.75;
      const oppAvgGoalsAgainst = 2.75;

      // Calculate power differential
      const starsPower = starsWinPct * 100;
      const oppPower = oppWinPct * 100;

      // Home ice advantage: +3 to power rating
      const homeAdvantage = game.isHome ? 3 : -3;
      const adjustedStarsPower = starsPower + homeAdvantage;

      // Calculate win probability
      const totalPower = adjustedStarsPower + oppPower;
      const starsWinProb = totalPower > 0 ? adjustedStarsPower / totalPower : 0.5;

      // Convert win probability to moneyline
      let starsMoneyline, oppMoneyline;

      if (starsWinProb > 0.5) {
        starsMoneyline = Math.round(-(starsWinProb / (1 - starsWinProb)) * 100);
        oppMoneyline = Math.round(((1 - starsWinProb) / starsWinProb) * 100);
      } else {
        starsMoneyline = Math.round(((1 - starsWinProb) / starsWinProb) * 100);
        oppMoneyline = Math.round(-(starsWinProb / (1 - starsWinProb)) * 100);
      }

      // Ensure reasonable moneyline ranges
      starsMoneyline = Math.max(-400, Math.min(400, starsMoneyline));
      oppMoneyline = Math.max(-400, Math.min(400, oppMoneyline));

      // Calculate Over/Under (average of both teams' goal tendencies)
      const expectedStarsGoals = (starsAvgGoalsFor + oppAvgGoalsAgainst) / 2;
      const expectedOppGoals = (oppAvgGoalsFor + starsAvgGoalsAgainst) / 2;
      const totalExpectedGoals = expectedStarsGoals + expectedOppGoals;
      const overUnder = (Math.round(totalExpectedGoals * 2) / 2).toFixed(1); // Round to nearest 0.5

      // Calculate Puck Line
      const goalDifferential = expectedStarsGoals - expectedOppGoals;
      const spread = goalDifferential > 0.3 ? "-1.5" : goalDifferential < -0.3 ? "+1.5" : "-1.5";

      const bettingOdds = {
        starsMoneyline: starsMoneyline >= 0 ? `+${starsMoneyline}` : `${starsMoneyline}`,
        opponentMoneyline: oppMoneyline >= 0 ? `+${oppMoneyline}` : `${oppMoneyline}`,
        overUnder: overUnder,
        spread: spread
      };

      // Update game with betting odds
      await updateDoc(doc(db, 'games', gameDoc.id), {
        bettingOdds: bettingOdds
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated betting odds for ${updatedCount} games`,
      starsStats: {
        winPct: starsWinPct.toFixed(3),
        avgGoalsFor: starsAvgGoalsFor.toFixed(2),
        avgGoalsAgainst: starsAvgGoalsAgainst.toFixed(2)
      }
    });
  } catch (error: any) {
    console.error('Error updating betting odds:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
