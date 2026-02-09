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

// ACTUAL 2025-26 AHL Standings from HockeyDB (February 9, 2026)
const realAHLStandings = [
  // EASTERN CONFERENCE - ATLANTIC DIVISION
  { teamName: 'Providence Bruins', teamCode: 'PRO', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 44, wins: 35, losses: 8, otLosses: 1, points: 71, goalsFor: 145, goalsAgainst: 86, goalDiff: 59, winPct: 0.807, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W4', rank: 1 },
  { teamName: 'Wilkes-Barre/Scranton Penguins', teamCode: 'WBS', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 46, wins: 32, losses: 12, otLosses: 2, points: 68, goalsFor: 161, goalsAgainst: 124, goalDiff: 37, winPct: 0.739, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 2 },
  { teamName: 'Charlotte Checkers', teamCode: 'CHA', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 44, wins: 26, losses: 15, otLosses: 3, points: 55, goalsFor: 147, goalsAgainst: 123, goalDiff: 24, winPct: 0.625, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 3 },
  { teamName: 'Hershey Bears', teamCode: 'HER', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 42, wins: 20, losses: 16, otLosses: 6, points: 48, goalsFor: 123, goalsAgainst: 132, goalDiff: -9, winPct: 0.571, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 4 },
  { teamName: 'Lehigh Valley Phantoms', teamCode: 'LV', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 43, wins: 21, losses: 20, otLosses: 2, points: 46, goalsFor: 127, goalsAgainst: 142, goalDiff: -15, winPct: 0.535, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 5 },
  { teamName: 'Bridgeport Islanders', teamCode: 'BRI', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 42, wins: 20, losses: 20, otLosses: 2, points: 45, goalsFor: 140, goalsAgainst: 137, goalDiff: 3, winPct: 0.536, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 6 },
  { teamName: 'Hartford Wolf Pack', teamCode: 'HAR', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 43, wins: 16, losses: 23, otLosses: 4, points: 38, goalsFor: 115, goalsAgainst: 155, goalDiff: -40, winPct: 0.442, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L3', rank: 7 },
  { teamName: 'Springfield Thunderbirds', teamCode: 'SPR', conference: 'Eastern Conference', division: 'Atlantic Division', gamesPlayed: 44, wins: 16, losses: 24, otLosses: 4, points: 38, goalsFor: 114, goalsAgainst: 162, goalDiff: -48, winPct: 0.432, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 8 },

  // EASTERN CONFERENCE - NORTH DIVISION
  { teamName: 'Laval Rocket', teamCode: 'LAV', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 45, wins: 29, losses: 14, otLosses: 2, points: 62, goalsFor: 151, goalsAgainst: 124, goalDiff: 27, winPct: 0.689, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W3', rank: 1 },
  { teamName: 'Syracuse Crunch', teamCode: 'SYR', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 45, wins: 26, losses: 16, otLosses: 3, points: 56, goalsFor: 149, goalsAgainst: 122, goalDiff: 27, winPct: 0.622, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 2 },
  { teamName: 'Cleveland Monsters', teamCode: 'CLE', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 44, wins: 23, losses: 15, otLosses: 6, points: 53, goalsFor: 130, goalsAgainst: 137, goalDiff: -7, winPct: 0.602, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 3 },
  { teamName: 'Toronto Marlies', teamCode: 'TOR', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 42, wins: 23, losses: 15, otLosses: 4, points: 53, goalsFor: 142, goalsAgainst: 147, goalDiff: -5, winPct: 0.631, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 4 },
  { teamName: 'Rochester Americans', teamCode: 'ROC', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 43, wins: 23, losses: 16, otLosses: 4, points: 52, goalsFor: 143, goalsAgainst: 130, goalDiff: 13, winPct: 0.605, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 5 },
  { teamName: 'Belleville Senators', teamCode: 'BEL', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 49, wins: 20, losses: 21, otLosses: 8, points: 48, goalsFor: 159, goalsAgainst: 178, goalDiff: -19, winPct: 0.490, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 6 },
  { teamName: 'Utica Comets', teamCode: 'UTI', conference: 'Eastern Conference', division: 'North Division', gamesPlayed: 40, wins: 13, losses: 22, otLosses: 5, points: 34, goalsFor: 103, goalsAgainst: 141, goalDiff: -38, winPct: 0.425, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L4', rank: 7 },

  // WESTERN CONFERENCE - CENTRAL DIVISION
  { teamName: 'Grand Rapids Griffins', teamCode: 'GR', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 44, wins: 35, losses: 7, otLosses: 2, points: 73, goalsFor: 156, goalsAgainst: 88, goalDiff: 68, winPct: 0.830, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W6', rank: 1 },
  { teamName: 'Chicago Wolves', teamCode: 'CHI', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 38, wins: 22, losses: 11, otLosses: 5, points: 54, goalsFor: 139, goalsAgainst: 134, goalDiff: 5, winPct: 0.711, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 2 },
  { teamName: 'Texas Stars', teamCode: 'TEX', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 44, wins: 22, losses: 19, otLosses: 3, points: 48, goalsFor: 129, goalsAgainst: 137, goalDiff: -8, winPct: 0.545, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 3 },
  { teamName: 'Manitoba Moose', teamCode: 'MAN', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 42, wins: 22, losses: 17, otLosses: 3, points: 47, goalsFor: 110, goalsAgainst: 117, goalDiff: -7, winPct: 0.560, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 4 },
  { teamName: 'Milwaukee Admirals', teamCode: 'MIL', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 41, wins: 19, losses: 20, otLosses: 2, points: 42, goalsFor: 122, goalsAgainst: 127, goalDiff: -5, winPct: 0.512, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 5 },
  { teamName: 'Rockford IceHogs', teamCode: 'ROC', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 45, wins: 17, losses: 26, otLosses: 2, points: 38, goalsFor: 127, goalsAgainst: 158, goalDiff: -31, winPct: 0.422, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L4', rank: 6 },
  { teamName: 'Iowa Wild', teamCode: 'IOW', conference: 'Western Conference', division: 'Central Division', gamesPlayed: 43, wins: 13, losses: 26, otLosses: 4, points: 31, goalsFor: 98, goalsAgainst: 141, goalDiff: -43, winPct: 0.360, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L5', rank: 7 },

  // WESTERN CONFERENCE - PACIFIC DIVISION
  { teamName: 'Ontario Reign', teamCode: 'ONT', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 46, wins: 31, losses: 14, otLosses: 1, points: 64, goalsFor: 159, goalsAgainst: 130, goalDiff: 29, winPct: 0.696, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W3', rank: 1 },
  { teamName: 'Colorado Eagles', teamCode: 'COL', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 41, wins: 29, losses: 10, otLosses: 2, points: 63, goalsFor: 146, goalsAgainst: 104, goalDiff: 42, winPct: 0.768, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W5', rank: 2 },
  { teamName: 'Bakersfield Condors', teamCode: 'BAK', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 46, wins: 25, losses: 14, otLosses: 7, points: 57, goalsFor: 159, goalsAgainst: 142, goalDiff: 17, winPct: 0.620, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 3 },
  { teamName: 'San Jose Barracuda', teamCode: 'SJ', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 41, wins: 26, losses: 14, otLosses: 1, points: 55, goalsFor: 143, goalsAgainst: 131, goalDiff: 12, winPct: 0.671, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 4 },
  { teamName: 'Coachella Valley Firebirds', teamCode: 'CV', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 45, wins: 25, losses: 15, otLosses: 5, points: 55, goalsFor: 154, goalsAgainst: 140, goalDiff: 14, winPct: 0.611, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 5 },
  { teamName: 'San Diego Gulls', teamCode: 'SD', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 41, wins: 21, losses: 14, otLosses: 6, points: 51, goalsFor: 130, goalsAgainst: 126, goalDiff: 4, winPct: 0.622, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 6 },
  { teamName: 'Tucson Roadrunners', teamCode: 'TUC', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 45, wins: 21, losses: 16, otLosses: 8, points: 50, goalsFor: 147, goalsAgainst: 147, goalDiff: 0, winPct: 0.556, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 7 },
  { teamName: 'Henderson Silver Knights', teamCode: 'HEN', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 41, wins: 18, losses: 17, otLosses: 6, points: 44, goalsFor: 134, goalsAgainst: 137, goalDiff: -3, winPct: 0.537, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 8 },
  { teamName: 'Calgary Wranglers', teamCode: 'CAL', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 45, wins: 16, losses: 19, otLosses: 10, points: 44, goalsFor: 127, goalsAgainst: 171, goalDiff: -44, winPct: 0.489, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 9 },
  { teamName: 'Abbotsford Canucks', teamCode: 'ABB', conference: 'Western Conference', division: 'Pacific Division', gamesPlayed: 45, wins: 16, losses: 26, otLosses: 3, points: 38, goalsFor: 105, goalsAgainst: 164, goalDiff: -59, winPct: 0.422, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L3', rank: 10 }
];

async function updateStandings() {
  console.log('🏒 Updating REAL 2025-26 AHL Standings...\n');

  // Clear old standings
  const snapshot = await getDocs(collection(db, 'standings'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log('✅ Cleared old standings\n');

  // Add new standings
  for (const team of realAHLStandings) {
    await addDoc(collection(db, 'standings'), {
      ...team,
      lastUpdated: new Date()
    });
  }

  // Display standings
  const eastern = realAHLStandings.filter(t => t.conference === 'Eastern Conference');
  const western = realAHLStandings.filter(t => t.conference === 'Western Conference');

  const atlantic = eastern.filter(t => t.division === 'Atlantic Division');
  const north = eastern.filter(t => t.division === 'North Division');
  const central = western.filter(t => t.division === 'Central Division');
  const pacific = western.filter(t => t.division === 'Pacific Division');

  console.log('✅ REAL STANDINGS UPDATED!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('         2025-26 AHL STANDINGS (CURRENT)');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('🔷 EASTERN CONFERENCE - ATLANTIC DIVISION');
  atlantic.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n🔷 EASTERN CONFERENCE - NORTH DIVISION');
  north.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n🟠 WESTERN CONFERENCE - CENTRAL DIVISION');
  central.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts) ${t.streak}`));

  console.log('\n🟠 WESTERN CONFERENCE - PACIFIC DIVISION');
  pacific.forEach((t, i) => console.log(`   ${i + 1}. ${t.teamName.padEnd(35)} ${t.wins}-${t.losses}-${t.otLosses} (${t.points} pts)`));

  console.log('\n═══════════════════════════════════════════════════');

  const texasStars = central.find(t => t.teamCode === 'TEX');
  console.log(`\n🌟 TEXAS STARS: #${texasStars.rank} in Central Division`);
  console.log(`   Record: ${texasStars.wins}-${texasStars.losses}-${texasStars.otLosses} (${texasStars.points} points)`);
  console.log(`   Goals For: ${texasStars.goalsFor} | Goals Against: ${texasStars.goalsAgainst}`);
  console.log(`   Goal Differential: ${texasStars.goalDiff}`);
  console.log(`   Current Streak: ${texasStars.streak}`);
}

async function main() {
  try {
    await updateStandings();
    console.log('\n✅ Real 2025-26 AHL standings updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
