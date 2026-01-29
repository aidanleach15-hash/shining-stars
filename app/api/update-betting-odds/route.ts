import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, updateDoc, doc, where } from 'firebase/firestore';

export async function GET() {
  try {
    // Fetch AHL team statistics
    const statsResponse = await fetch('https://lscluster.hockeytech.com/feed/?feed=modulekit&view=statviewtype&type=teams&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&league_code=&season_id=79&first=0&limit=100&sort=win_pct&stat=standings&order_direction=DESC');

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch AHL stats');
    }

    const statsData = await statsResponse.json();
    const teams = statsData?.SiteKit?.Statviewtype || [];

    // Find Texas Stars stats
    const texasStarsStats = teams.find((team: any) =>
      team.team_code === 'TEX' || team.name?.includes('Texas Stars')
    );

    if (!texasStarsStats) {
      return NextResponse.json({
        success: false,
        error: 'Could not find Texas Stars stats'
      }, { status: 404 });
    }

    // Calculate Texas Stars metrics
    const starsWinPct = parseFloat(texasStarsStats.win_pct || '0.500');
    const starsGoalsFor = parseFloat(texasStarsStats.goals_for || '0');
    const starsGoalsAgainst = parseFloat(texasStarsStats.goals_against || '0');
    const starsGamesPlayed = parseInt(texasStarsStats.games_played || '1');
    const starsAvgGoalsFor = starsGamesPlayed > 0 ? starsGoalsFor / starsGamesPlayed : 2.5;
    const starsAvgGoalsAgainst = starsGamesPlayed > 0 ? starsGoalsAgainst / starsGamesPlayed : 2.5;

    // Fetch all upcoming games from Firebase
    const gamesQuery = query(collection(db, 'games'));
    const gamesSnapshot = await getDocs(gamesQuery);

    let updatedCount = 0;

    for (const gameDoc of gamesSnapshot.docs) {
      const game = gameDoc.data();

      // Find opponent stats
      const opponentStats = teams.find((team: any) =>
        game.opponent && (
          team.name?.toUpperCase().includes(game.opponent.split(' ')[0]) ||
          team.team_code?.toUpperCase() === game.opponent.substring(0, 3)
        )
      );

      let bettingOdds;

      if (opponentStats) {
        // Calculate opponent metrics
        const oppWinPct = parseFloat(opponentStats.win_pct || '0.500');
        const oppGoalsFor = parseFloat(opponentStats.goals_for || '0');
        const oppGoalsAgainst = parseFloat(opponentStats.goals_against || '0');
        const oppGamesPlayed = parseInt(opponentStats.games_played || '1');
        const oppAvgGoalsFor = oppGamesPlayed > 0 ? oppGoalsFor / oppGamesPlayed : 2.5;
        const oppAvgGoalsAgainst = oppGamesPlayed > 0 ? oppGoalsAgainst / oppGamesPlayed : 2.5;

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
        // Formula: If prob > 0.5: -(prob / (1-prob)) * 100, else: ((1-prob) / prob) * 100
        let starsMoneyline, oppMoneyline;

        if (starsWinProb > 0.5) {
          starsMoneyline = Math.round(-(starsWinProb / (1 - starsWinProb)) * 100);
          oppMoneyline = Math.round(((1 - starsWinProb) / starsWinProb) * 100);
        } else {
          starsMoneyline = Math.round(((1 - starsWinProb) / starsWinProb) * 100);
          oppMoneyline = Math.round(-(starsWinProb / (1 - starsWinProb)) * 100);
        }

        // Calculate Over/Under (average of both teams' goal tendencies)
        const expectedStarsGoals = (starsAvgGoalsFor + oppAvgGoalsAgainst) / 2;
        const expectedOppGoals = (oppAvgGoalsFor + starsAvgGoalsAgainst) / 2;
        const totalExpectedGoals = expectedStarsGoals + expectedOppGoals;
        const overUnder = (Math.round(totalExpectedGoals * 2) / 2).toFixed(1); // Round to nearest 0.5

        // Calculate Puck Line (typically -1.5 for favorite, +1.5 for underdog)
        const goalDifferential = expectedStarsGoals - expectedOppGoals;
        let spread;

        if (Math.abs(goalDifferential) > 0.5) {
          spread = goalDifferential > 0 ? "-1.5" : "+1.5";
        } else {
          spread = "-1.5"; // Default to Stars covering if even
        }

        bettingOdds = {
          starsMoneyline: starsMoneyline >= 0 ? `+${starsMoneyline}` : `${starsMoneyline}`,
          opponentMoneyline: oppMoneyline >= 0 ? `+${oppMoneyline}` : `${oppMoneyline}`,
          overUnder: overUnder,
          spread: spread
        };
      } else {
        // Default odds if opponent not found
        bettingOdds = {
          starsMoneyline: game.isHome ? "-140" : "+110",
          opponentMoneyline: game.isHome ? "+120" : "-130",
          overUnder: "5.5",
          spread: game.isHome ? "-1.5" : "+1.5"
        };
      }

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
        winPct: starsWinPct,
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
