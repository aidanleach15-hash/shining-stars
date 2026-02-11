import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import * as cheerio from 'cheerio';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TEAM_CODE_MAP = {
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

const DIVISION_MAP = {
  'Atlantic': { division: 'Atlantic Division', conference: 'Eastern Conference' },
  'North': { division: 'North Division', conference: 'Eastern Conference' },
  'Central': { division: 'Central Division', conference: 'Western Conference' },
  'Pacific': { division: 'Pacific Division', conference: 'Western Conference' }
};

async function fetchAHLStandings() {
  const url = 'https://www.hockeydb.com/ihdb/stats/leagues/seasons/ahl19412026.html';

  console.log('🌐 Fetching from HockeyDB...');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const allTeams = [];
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
        goalDiff: gf - ga,
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
}

async function updateStandings() {
  console.log('🏒 UPDATING LIVE AHL STANDINGS\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Fetch live data
    const standings = await fetchAHLStandings();
    console.log(`✅ Fetched ${standings.length} teams from HockeyDB\n`);

    // Clear old standings
    const snapshot = await getDocs(collection(db, 'standings'));
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log('✅ Cleared old standings\n');

    // Add new standings
    for (const team of standings) {
      await addDoc(collection(db, 'standings'), {
        ...team,
        lastUpdated: new Date()
      });
    }
    console.log('✅ Added new standings to Firebase\n');

    // Display summary
    const eastern = standings.filter(t => t.conference === 'Eastern Conference');
    const western = standings.filter(t => t.conference === 'Western Conference');

    console.log('═══════════════════════════════════════════════════');
    console.log('           2025-26 AHL STANDINGS (LIVE)');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('🔷 EASTERN CONFERENCE');
    console.log('   Atlantic Division:');
    eastern.filter(t => t.division === 'Atlantic Division').forEach((t, i) =>
      console.log(`      ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`)
    );
    console.log('   North Division:');
    eastern.filter(t => t.division === 'North Division').forEach((t, i) =>
      console.log(`      ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`)
    );

    console.log('\n🟠 WESTERN CONFERENCE');
    console.log('   Central Division:');
    western.filter(t => t.division === 'Central Division').forEach((t, i) =>
      console.log(`      ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`)
    );
    console.log('   Pacific Division:');
    western.filter(t => t.division === 'Pacific Division').forEach((t, i) =>
      console.log(`      ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`)
    );

    const texasStars = standings.find(t => t.teamCode === 'TEX');
    if (texasStars) {
      console.log('\n═══════════════════════════════════════════════════');
      console.log(`🌟 TEXAS STARS: #${texasStars.rank} in Central Division`);
      console.log(`   Record: ${texasStars.wins}-${texasStars.losses}-${texasStars.otLosses} (${texasStars.points} points)`);
      console.log(`   Goal Differential: ${texasStars.goalDiff > 0 ? '+' : ''}${texasStars.goalDiff}`);
      console.log(`   Current Streak: ${texasStars.streak}`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n✅ Live AHL standings updated successfully!');
    console.log(`📊 Total teams: ${standings.length}`);
    console.log(`🕒 Updated at: ${new Date().toLocaleString()}\n`);

  } catch (error) {
    console.error('\n❌ Error updating standings:', error);
    throw error;
  }
}

async function main() {
  try {
    await updateStandings();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
