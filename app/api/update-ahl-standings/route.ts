import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Team code mappings
const TEAM_CODE_MAP: Record<string, string> = {
  'Providence Bruins': 'PRO',
  'Wilkes-Barre/Scranton Penguins': 'WBS',
  'Charlotte Checkers': 'CHA',
  'Hershey Bears': 'HER',
  'Lehigh Valley Phantoms': 'LV',
  'Bridgeport Islanders': 'BRI',
  'Hartford Wolf Pack': 'HAR',
  'Springfield Thunderbirds': 'SPR',
  'Laval Rocket': 'LAV',
  'Syracuse Crunch': 'SYR',
  'Cleveland Monsters': 'CLE',
  'Toronto Marlies': 'TOR',
  'Rochester Americans': 'ROC',
  'Belleville Senators': 'BEL',
  'Utica Comets': 'UTI',
  'Grand Rapids Griffins': 'GR',
  'Chicago Wolves': 'CHI',
  'Texas Stars': 'TEX',
  'Manitoba Moose': 'MAN',
  'Milwaukee Admirals': 'MIL',
  'Rockford IceHogs': 'RFD',
  'Iowa Wild': 'IOW',
  'Ontario Reign': 'ONT',
  'Colorado Eagles': 'COL',
  'Bakersfield Condors': 'BAK',
  'San Jose Barracuda': 'SJ',
  'Coachella Valley Firebirds': 'CV',
  'San Diego Gulls': 'SD',
  'Tucson Roadrunners': 'TUC',
  'Henderson Silver Knights': 'HEN',
  'Calgary Wranglers': 'CAL',
  'Abbotsford Canucks': 'ABB'
};

const DIVISION_MAP: Record<string, { division: string; conference: string }> = {
  'Atlantic': { division: 'Atlantic Division', conference: 'Eastern Conference' },
  'North': { division: 'North Division', conference: 'Eastern Conference' },
  'Central': { division: 'Central Division', conference: 'Western Conference' },
  'Pacific': { division: 'Pacific Division', conference: 'Western Conference' }
};

interface TeamStanding {
  teamName: string;
  teamCode: string;
  conference: string;
  division: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  winPct: number;
  homeRecord: string;
  awayRecord: string;
  streak: string;
  rank: number;
}

async function fetchAHLStandings(): Promise<TeamStanding[]> {
  const url = 'https://www.hockeydb.com/ihdb/stats/leagues/seasons/ahl19412026.html';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const allTeams: TeamStanding[] = [];
    let currentDivision = '';
    let rank = 1;

    // Find the main standings table
    $('table').each((tableIndex, table) => {
      $(table).find('tr').each((rowIndex, row) => {
        const $row = $(row);

        // Check if this row contains a division header
        const divisionCell = $row.find('td.c_sec_head');
        if (divisionCell.length > 0) {
          const divText = divisionCell.text().trim();
          if (divText.includes('Atlantic')) currentDivision = 'Atlantic';
          else if (divText.includes('North')) currentDivision = 'North';
          else if (divText.includes('Central')) currentDivision = 'Central';
          else if (divText.includes('Pacific')) currentDivision = 'Pacific';
          rank = 1; // Reset rank for new division
          return;
        }

        // Skip if we don't have a current division
        if (!currentDivision || !DIVISION_MAP[currentDivision]) return;

        // Try to parse team data
        const cols = $row.find('td');
        if (cols.length < 9) return;

        // Check if first column contains a team link
        const teamLink = $(cols[0]).find('a');
        if (teamLink.length === 0) return;

        const teamName = teamLink.text().trim();
        if (!teamName) return;

        const gp = parseInt($(cols[1]).text().trim()) || 0;
        const wins = parseInt($(cols[2]).text().trim()) || 0;
        const losses = parseInt($(cols[3]).text().trim()) || 0;
        const otl = parseInt($(cols[4]).text().trim()) || 0;
        // Skip column 5 (shootout losses/ties)
        const pts = parseInt($(cols[6]).text().trim()) || 0;
        const gf = parseInt($(cols[7]).text().trim()) || 0;
        const ga = parseInt($(cols[8]).text().trim()) || 0;
        const gd = gf - ga;

        if (gp === 0) return;

        const divisionInfo = DIVISION_MAP[currentDivision];
        const teamCode = TEAM_CODE_MAP[teamName] || teamName.substring(0, 3).toUpperCase();
        const winPct = gp > 0 ? wins / gp : 0;
        const streak = wins > losses ? `W${Math.min(wins - losses, 5)}` : `L${Math.min(losses - wins, 5)}`;

        allTeams.push({
          teamName,
          teamCode,
          conference: divisionInfo.conference,
          division: divisionInfo.division,
          gamesPlayed: gp,
          wins,
          losses,
          otLosses: otl,
          points: pts,
          goalsFor: gf,
          goalsAgainst: ga,
          goalDiff: gd,
          winPct: parseFloat(winPct.toFixed(3)),
          homeRecord: 'N/A',
          awayRecord: 'N/A',
          streak,
          rank
        });

        rank++;
      });
    });

    return allTeams;
  } catch (error) {
    console.error('Error fetching AHL standings:', error);
    throw error;
  }
}

export async function POST() {
  try {
    console.log('🏒 Fetching live AHL standings from HockeyDB...');

    // Fetch live standings data
    const standings = await fetchAHLStandings();

    if (standings.length === 0) {
      throw new Error('No standings data fetched');
    }

    console.log(`✅ Fetched ${standings.length} teams`);

    // Clear old standings
    const standingsSnapshot = await getDocs(collection(db, 'standings'));
    for (const doc of standingsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log('✅ Cleared old standings');

    // Add new standings
    for (const team of standings) {
      await addDoc(collection(db, 'standings'), {
        ...team,
        lastUpdated: new Date()
      });
    }
    console.log('✅ Added new standings to Firebase');

    return NextResponse.json({
      success: true,
      message: `Updated AHL standings with ${standings.length} teams`,
      teamsAdded: standings.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error updating AHL standings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Allow GET requests as well (for cron jobs)
export async function GET() {
  return POST();
}
