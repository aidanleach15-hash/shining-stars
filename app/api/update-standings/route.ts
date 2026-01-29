import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export async function POST() {
  try {
    const seasonId = '79'; // 2025-26 season

    // Fetch standings from AHL API
    const response = await fetch(
      `https://lscluster.hockeytech.com/feed/?feed=modulekit&view=statviewtype&type=teams&key=50c2cd9b5e18e390&fmt=json&client_code=ahl&lang=en&league_code=&season_id=${seasonId}&first=0&limit=100&sort=points&stat=standings&order_direction=DESC`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch standings from AHL API');
    }

    // Parse response as text first to handle any format issues
    let responseText = await response.text();
    responseText = responseText.replace(/^\uFEFF/, '').trim();

    // Try to strip JSONP wrappers if present
    if (responseText.match(/^(var|const|let)\s/)) {
      responseText = responseText.replace(/^(var|const|let)\s+\w+\s*=\s*/, '');
    }
    const functionCallMatch = responseText.match(/^([\w$]+)\s*\(/);
    if (functionCallMatch) {
      responseText = responseText.substring(functionCallMatch[0].length);
      responseText = responseText.replace(/\);?\s*$/, '');
    }
    if (responseText.startsWith('(') && responseText.endsWith(')')) {
      responseText = responseText.substring(1, responseText.length - 1);
    }
    responseText = responseText.replace(/;+\s*$/, '').trim();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error in standings:', parseError);
      throw new Error('Invalid JSON from AHL API');
    }

    const teams = data?.SiteKit?.Statviewtype || [];

    if (!teams || teams.length === 0) {
      throw new Error('No standings data found');
    }

    // Clear old standings
    const standingsSnapshot = await getDocs(collection(db, 'standings'));
    for (const doc of standingsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new standings
    let addedCount = 0;
    for (const team of teams) {
      try {
        const teamData = {
          teamName: team.name || team.team_name || 'Unknown',
          teamCode: team.team_code || '',
          division: team.division_long_name || team.division || 'Unknown',
          gamesPlayed: parseInt(team.games_played || team.gp) || 0,
          wins: parseInt(team.wins || team.w) || 0,
          losses: parseInt(team.losses || team.l) || 0,
          otLosses: parseInt(team.ot_losses || team.otl) || 0,
          points: parseInt(team.points || team.pts) || 0,
          goalsFor: parseInt(team.goals_for || team.gf) || 0,
          goalsAgainst: parseInt(team.goals_against || team.ga) || 0,
          goalDiff: parseInt(team.goal_differential || team.diff) || 0,
          winPct: parseFloat(team.win_pct || team.pct) || 0,
          homeRecord: team.home_record || '',
          awayRecord: team.away_record || '',
          streak: team.streak || '',
          rank: parseInt(team.rank) || 0,
          lastUpdated: new Date()
        };

        await addDoc(collection(db, 'standings'), teamData);
        addedCount++;
      } catch (teamError) {
        console.error('Error adding team:', teamError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated standings with ${addedCount} teams`,
      teamsAdded: addedCount
    });

  } catch (error: any) {
    console.error('Error updating standings:', error);

    // Fallback: Add sample standings data
    try {
      const standingsSnapshot = await getDocs(collection(db, 'standings'));
      if (standingsSnapshot.empty) {
        const sampleStandings = [
          {
            teamName: 'Texas Stars',
            teamCode: 'TEX',
            division: 'Central Division',
            gamesPlayed: 41,
            wins: 16,
            losses: 19,
            otLosses: 6,
            points: 38,
            goalsFor: 118,
            goalsAgainst: 122,
            goalDiff: -4,
            winPct: 0.463,
            homeRecord: '11-7-3',
            awayRecord: '5-12-3',
            streak: 'W1',
            rank: 5,
            lastUpdated: new Date()
          },
          {
            teamName: 'Manitoba Moose',
            teamCode: 'MB',
            division: 'Central Division',
            gamesPlayed: 40,
            wins: 22,
            losses: 13,
            otLosses: 5,
            points: 49,
            goalsFor: 125,
            goalsAgainst: 110,
            goalDiff: 15,
            winPct: 0.613,
            homeRecord: '13-5-2',
            awayRecord: '9-8-3',
            streak: 'L2',
            rank: 2,
            lastUpdated: new Date()
          }
        ];

        for (const team of sampleStandings) {
          await addDoc(collection(db, 'standings'), team);
        }

        return NextResponse.json({
          success: true,
          message: `Added ${sampleStandings.length} sample teams (API unavailable)`,
          teamsAdded: sampleStandings.length
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
