import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, updateDoc, doc, where } from 'firebase/firestore';

// Helper function to update games with default odds
async function updateGamesWithDefaultOdds() {
  const gamesQuery = query(collection(db, 'games'));
  const gamesSnapshot = await getDocs(gamesQuery);

  let updatedCount = 0;
  for (const gameDoc of gamesSnapshot.docs) {
    const game = gameDoc.data();

    const defaultOdds = {
      starsMoneyline: game.isHome ? "-140" : "+110",
      opponentMoneyline: game.isHome ? "+120" : "-130",
      overUnder: "5.5",
      spread: game.isHome ? "-1.5" : "+1.5"
    };

    await updateDoc(doc(db, 'games', gameDoc.id), {
      bettingOdds: defaultOdds
    });
    updatedCount++;
  }

  return NextResponse.json({
    success: true,
    message: `Updated ${updatedCount} games with default betting odds (API unavailable)`,
    starsStats: {
      winPct: 'N/A',
      avgGoalsFor: 'N/A',
      avgGoalsAgainst: 'N/A'
    }
  });
}

export async function GET() {
  try {
    // Fetch AHL team statistics with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const statsResponse = await fetch(
      'https://lscluster.hockeytech.com/feed/?feed=modulekit&view=statviewtype&type=teams&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&league_code=&season_id=79&first=0&limit=100&sort=win_pct&stat=standings&order_direction=DESC',
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    clearTimeout(timeoutId);

    if (!statsResponse.ok) {
      console.error('AHL API returned status:', statsResponse.status);
      throw new Error('Failed to fetch AHL stats');
    }

    // Get response as text first to check for issues
    let responseText = await statsResponse.text();

    // Remove BOM and other invisible characters
    responseText = responseText.replace(/^\uFEFF/, ''); // Remove BOM
    responseText = responseText.replace(/^\s+/, ''); // Remove leading whitespace
    responseText = responseText.replace(/\s+$/, ''); // Remove trailing whitespace

    // Log the first few characters to debug
    console.log('Response starts with:', responseText.substring(0, 50));
    console.log('First char code:', responseText.charCodeAt(0));

    // Strip JSONP/callback wrappers: callback(...), var x = ..., etc.
    // Common patterns: "callback({...})", "var data = {...}", "({...})"

    // Check for variable declarations
    if (responseText.match(/^(var|const|let)\s/)) {
      responseText = responseText.replace(/^(var|const|let)\s+\w+\s*=\s*/, '');
    }

    // Check for function call wrappers
    const functionCallMatch = responseText.match(/^([\w$]+)\s*\(/);
    if (functionCallMatch) {
      // Remove function name and opening paren
      responseText = responseText.substring(functionCallMatch[0].length);
      // Remove closing paren and semicolon from end
      responseText = responseText.replace(/\);?\s*$/, '');
    }

    // Check for parentheses wrapper
    if (responseText.startsWith('(') && responseText.endsWith(')')) {
      responseText = responseText.substring(1, responseText.length - 1);
    }

    // Remove trailing semicolons and whitespace again
    responseText = responseText.replace(/;+\s*$/, '').trim();

    let statsData;
    try {
      statsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text (first 300 chars):', responseText.substring(0, 300));
      console.error('Response text (last 100 chars):', responseText.substring(Math.max(0, responseText.length - 100)));

      // Use default values if API fails
      console.log('Using default betting odds due to API error');
      return await updateGamesWithDefaultOdds();
    }

    const teams = statsData?.SiteKit?.Statviewtype || [];

    if (!teams || teams.length === 0) {
      console.log('No teams data found, using default odds');
      return await updateGamesWithDefaultOdds();
    }

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

    // Try to update with default odds on error
    try {
      return await updateGamesWithDefaultOdds();
    } catch (fallbackError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
}
