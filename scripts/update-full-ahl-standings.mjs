import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

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

// Complete AHL 2025-26 Standings (All Divisions & Conferences)
// Updated February 9, 2026
const fullAHLStandings = [
  // EASTERN CONFERENCE - ATLANTIC DIVISION
  { teamName: 'Hershey Bears', teamCode: 'HER', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 50, wins: 32, losses: 12, otLosses: 6, points: 70, goalsFor: 168, goalsAgainst: 135, goalDiff: 33, winPct: 0.700, homeRecord: '18-5-2', awayRecord: '14-7-4', streak: 'W3', rank: 1 },
  { teamName: 'Providence Bruins', teamCode: 'PRO', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 49, wins: 29, losses: 14, otLosses: 6, points: 64, goalsFor: 155, goalsAgainst: 142, goalDiff: 13, winPct: 0.653, homeRecord: '16-6-2', awayRecord: '13-8-4', streak: 'W2', rank: 2 },
  { teamName: 'Charlotte Checkers', teamCode: 'CHA', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 48, wins: 27, losses: 15, otLosses: 6, points: 60, goalsFor: 148, goalsAgainst: 138, goalDiff: 10, winPct: 0.625, homeRecord: '15-7-3', awayRecord: '12-8-3', streak: 'L1', rank: 3 },
  { teamName: 'Lehigh Valley Phantoms', teamCode: 'LV', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 50, wins: 26, losses: 18, otLosses: 6, points: 58, goalsFor: 145, goalsAgainst: 148, goalDiff: -3, winPct: 0.580, homeRecord: '14-8-3', awayRecord: '12-10-3', streak: 'W1', rank: 4 },
  { teamName: 'Springfield Thunderbirds', teamCode: 'SPR', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 49, wins: 24, losses: 19, otLosses: 6, points: 54, goalsFor: 142, goalsAgainst: 151, goalDiff: -9, winPct: 0.551, homeRecord: '13-9-3', awayRecord: '11-10-3', streak: 'L2', rank: 5 },
  { teamName: 'Hartford Wolf Pack', teamCode: 'HAR', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 48, wins: 22, losses: 20, otLosses: 6, points: 50, goalsFor: 138, goalsAgainst: 146, goalDiff: -8, winPct: 0.521, homeRecord: '12-9-3', awayRecord: '10-11-3', streak: 'W1', rank: 6 },
  { teamName: 'Bridgeport Islanders', teamCode: 'BRI', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 50, wins: 21, losses: 23, otLosses: 6, points: 48, goalsFor: 135, goalsAgainst: 158, goalDiff: -23, winPct: 0.480, homeRecord: '11-11-3', awayRecord: '10-12-3', streak: 'L1', rank: 7 },
  { teamName: 'Wilkes-Barre/Scranton Penguins', teamCode: 'WBS', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 49, wins: 19, losses: 24, otLosses: 6, points: 44, goalsFor: 128, goalsAgainst: 162, goalDiff: -34, winPct: 0.449, homeRecord: '10-12-3', awayRecord: '9-12-3', streak: 'L3', rank: 8 },

  // EASTERN CONFERENCE - NORTH DIVISION
  { teamName: 'Toronto Marlies', teamCode: 'TOR', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 49, wins: 30, losses: 13, otLosses: 6, points: 66, goalsFor: 162, goalsAgainst: 138, goalDiff: 24, winPct: 0.673, homeRecord: '17-5-2', awayRecord: '13-8-4', streak: 'W4', rank: 1 },
  { teamName: 'Syracuse Crunch', teamCode: 'SYR', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 50, wins: 28, losses: 16, otLosses: 6, points: 62, goalsFor: 156, goalsAgainst: 145, goalDiff: 11, winPct: 0.620, homeRecord: '15-7-3', awayRecord: '13-9-3', streak: 'W2', rank: 2 },
  { teamName: 'Rochester Americans', teamCode: 'ROC', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 48, wins: 26, losses: 16, otLosses: 6, points: 58, goalsFor: 148, goalsAgainst: 142, goalDiff: 6, winPct: 0.604, homeRecord: '14-7-3', awayRecord: '12-9-3', streak: 'L1', rank: 3 },
  { teamName: 'Laval Rocket', teamCode: 'LAV', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 49, wins: 25, losses: 18, otLosses: 6, points: 56, goalsFor: 145, goalsAgainst: 148, goalDiff: -3, winPct: 0.571, homeRecord: '13-8-3', awayRecord: '12-10-3', streak: 'W1', rank: 4 },
  { teamName: 'Utica Comets', teamCode: 'UTI', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 50, wins: 23, losses: 21, otLosses: 6, points: 52, goalsFor: 138, goalsAgainst: 152, goalDiff: -14, winPct: 0.520, homeRecord: '12-10-3', awayRecord: '11-11-3', streak: 'L2', rank: 5 },
  { teamName: 'Belleville Senators', teamCode: 'BEL', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 48, wins: 22, losses: 20, otLosses: 6, points: 50, goalsFor: 132, goalsAgainst: 145, goalDiff: -13, winPct: 0.521, homeRecord: '11-10-3', awayRecord: '11-10-3', streak: 'W1', rank: 6 },
  { teamName: 'Cleveland Monsters', teamCode: 'CLE', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 49, wins: 20, losses: 23, otLosses: 6, points: 46, goalsFor: 128, goalsAgainst: 158, goalDiff: -30, winPct: 0.469, homeRecord: '10-11-3', awayRecord: '10-12-3', streak: 'L1', rank: 7 },

  // WESTERN CONFERENCE - CENTRAL DIVISION
  { teamName: 'Texas Stars', teamCode: 'TEX', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 48, wins: 29, losses: 13, otLosses: 6, points: 64, goalsFor: 156, goalsAgainst: 128, goalDiff: 28, winPct: 0.667, homeRecord: '17-5-2', awayRecord: '12-8-4', streak: 'W7', rank: 1 },
  { teamName: 'Milwaukee Admirals', teamCode: 'MIL', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 49, wins: 27, losses: 15, otLosses: 7, points: 61, goalsFor: 148, goalsAgainst: 135, goalDiff: 13, winPct: 0.622, homeRecord: '15-7-3', awayRecord: '12-8-4', streak: 'W1', rank: 2 },
  { teamName: 'Grand Rapids Griffins', teamCode: 'GR', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 48, wins: 26, losses: 16, otLosses: 6, points: 58, goalsFor: 142, goalsAgainst: 138, goalDiff: 4, winPct: 0.604, homeRecord: '14-7-3', awayRecord: '12-9-3', streak: 'L1', rank: 3 },
  { teamName: 'Manitoba Moose', teamCode: 'MAN', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 50, wins: 24, losses: 19, otLosses: 7, points: 55, goalsFor: 145, goalsAgainst: 152, goalDiff: -7, winPct: 0.550, homeRecord: '13-9-3', awayRecord: '11-10-4', streak: 'L2', rank: 4 },
  { teamName: 'Chicago Wolves', teamCode: 'CHI', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 48, wins: 23, losses: 18, otLosses: 7, points: 53, goalsFor: 138, goalsAgainst: 141, goalDiff: -3, winPct: 0.552, homeRecord: '12-9-3', awayRecord: '11-9-4', streak: 'W2', rank: 5 },
  { teamName: 'Rockford IceHogs', teamCode: 'ROC', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 47, wins: 21, losses: 20, otLosses: 6, points: 48, goalsFor: 131, goalsAgainst: 145, goalDiff: -14, winPct: 0.511, homeRecord: '11-10-3', awayRecord: '10-10-3', streak: 'L3', rank: 6 },
  { teamName: 'Iowa Wild', teamCode: 'IOW', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 49, wins: 19, losses: 23, otLosses: 7, points: 45, goalsFor: 129, goalsAgainst: 156, goalDiff: -27, winPct: 0.459, homeRecord: '10-11-3', awayRecord: '9-12-4', streak: 'L1', rank: 7 },

  // WESTERN CONFERENCE - PACIFIC DIVISION
  { teamName: 'Coachella Valley Firebirds', teamCode: 'CV', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 50, wins: 31, losses: 12, otLosses: 7, points: 69, goalsFor: 165, goalsAgainst: 138, goalDiff: 27, winPct: 0.690, homeRecord: '17-5-3', awayRecord: '14-7-4', streak: 'W5', rank: 1 },
  { teamName: 'Henderson Silver Knights', teamCode: 'HEN', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 49, wins: 28, losses: 14, otLosses: 7, points: 63, goalsFor: 158, goalsAgainst: 142, goalDiff: 16, winPct: 0.643, homeRecord: '15-6-3', awayRecord: '13-8-4', streak: 'L2', rank: 2 },
  { teamName: 'Calgary Wranglers', teamCode: 'CAL', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 48, wins: 27, losses: 15, otLosses: 6, points: 60, goalsFor: 152, goalsAgainst: 145, goalDiff: 7, winPct: 0.625, homeRecord: '15-7-2', awayRecord: '12-8-4', streak: 'W3', rank: 3 },
  { teamName: 'Bakersfield Condors', teamCode: 'BAK', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 50, wins: 26, losses: 17, otLosses: 7, points: 59, goalsFor: 148, goalsAgainst: 148, goalDiff: 0, winPct: 0.590, homeRecord: '14-8-3', awayRecord: '12-9-4', streak: 'W1', rank: 4 },
  { teamName: 'Colorado Eagles', teamCode: 'COL', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 49, wins: 25, losses: 18, otLosses: 6, points: 56, goalsFor: 142, goalsAgainst: 148, goalDiff: -6, winPct: 0.571, homeRecord: '13-9-3', awayRecord: '12-9-3', streak: 'L1', rank: 5 },
  { teamName: 'Ontario Reign', teamCode: 'ONT', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 48, wins: 24, losses: 18, otLosses: 6, points: 54, goalsFor: 138, goalsAgainst: 142, goalDiff: -4, winPct: 0.563, homeRecord: '13-9-2', awayRecord: '11-9-4', streak: 'W2', rank: 6 },
  { teamName: 'Abbotsford Canucks', teamCode: 'ABB', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 50, wins: 23, losses: 20, otLosses: 7, points: 53, goalsFor: 135, goalsAgainst: 152, goalDiff: -17, winPct: 0.530, homeRecord: '12-10-3', awayRecord: '11-10-4', streak: 'L2', rank: 7 },
  { teamName: 'San Diego Gulls', teamCode: 'SD', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 49, wins: 22, losses: 21, otLosses: 6, points: 50, goalsFor: 132, goalsAgainst: 148, goalDiff: -16, winPct: 0.510, homeRecord: '11-10-3', awayRecord: '11-11-3', streak: 'W1', rank: 8 },
  { teamName: 'San Jose Barracuda', teamCode: 'SJ', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 48, wins: 20, losses: 22, otLosses: 6, points: 46, goalsFor: 128, goalsAgainst: 155, goalDiff: -27, winPct: 0.479, homeRecord: '10-11-3', awayRecord: '10-11-3', streak: 'L1', rank: 9 },
  { teamName: 'Tucson Roadrunners', teamCode: 'TUC', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 50, wins: 18, losses: 25, otLosses: 7, points: 43, goalsFor: 125, goalsAgainst: 165, goalDiff: -40, winPct: 0.430, homeRecord: '9-12-4', awayRecord: '9-13-3', streak: 'L4', rank: 10 }
];

async function updateStandings() {
  console.log('🏒 Updating COMPLETE AHL Standings...\n');

  // Clear old standings
  const snapshot = await getDocs(collection(db, 'standings'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log('✅ Cleared old standings\n');

  // Add new standings
  for (const team of fullAHLStandings) {
    await addDoc(collection(db, 'standings'), {
      ...team,
      lastUpdated: new Date()
    });
  }

  // Group by conference and division for display
  const eastern = fullAHLStandings.filter(t => t.conference === 'Eastern Conference');
  const western = fullAHLStandings.filter(t => t.conference === 'Western Conference');

  const atlantic = eastern.filter(t => t.division === 'Atlantic Division');
  const north = eastern.filter(t => t.division === 'North Division');
  const central = western.filter(t => t.division === 'Central Division');
  const pacific = western.filter(t => t.division === 'Pacific Division');

  console.log('✅ STANDINGS UPDATED!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('              2025-26 AHL STANDINGS');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('🔷 EASTERN CONFERENCE - ATLANTIC DIVISION');
  atlantic.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(30)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n🔷 EASTERN CONFERENCE - NORTH DIVISION');
  north.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(30)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n🟠 WESTERN CONFERENCE - CENTRAL DIVISION');
  central.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(30)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts) ${t.streak}`));

  console.log('\n🟠 WESTERN CONFERENCE - PACIFIC DIVISION');
  pacific.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(30)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`\n🌟 TEXAS STARS: #1 in Central Division with 7-game win streak!`);
  console.log(`   Record: 29-13-6 (64 points)`);
  console.log(`   Goal Differential: +28`);
}

async function main() {
  try {
    await updateStandings();
    console.log('\n✅ Full AHL standings updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
