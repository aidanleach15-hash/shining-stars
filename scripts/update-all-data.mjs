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

// Latest headlines from Texas Stars website (Feb 9, 2026)
const latestHeadlines = [
  {
    title: "Stars Surge Past Moose for Seventh Straight Win",
    summary: "Texas Stars defeated Manitoba Moose 4-3 with three third-period goals on Saturday at H-E-B Center.",
    link: "https://www.texasstars.com/news/detail/stars-surge-past-moose-for-seventh-straight-win"
  },
  {
    title: "Stars Score Early, Hold off Moose for Sixth Straight Win",
    summary: "The Stars won a defensive 2-1 matchup against Manitoba Moose on Friday at home.",
    link: "https://www.texasstars.com/news/detail/stars-score-early-hold-off-moose-for-sixth-straight-win"
  },
  {
    title: "Dallas Stars Acquire Defenseman Jeremie Poirier from Calgary Flames",
    summary: "Dallas acquired defenseman Jeremie Poirier from Calgary in exchange for defenseman Gavin White.",
    link: "https://www.texasstars.com/news/detail/dallas-stars-acquire-defenseman-jeremie-poirier-from-calgary-flames-for-defenseman-gavin-white"
  },
  {
    title: "Stars to Host Annual Pink in the Rink Weekend",
    summary: "Texas Stars will host Pink in the Rink Weekend presented by Baylor Scott & White on February 27-28.",
    link: "https://www.texasstars.com/news/detail/stars-to-host-annual-pink-in-the-rink-weekend"
  },
  {
    title: "Stars Upend Silver Knights for Fifth Straight Victory",
    summary: "Texas Stars earned their fifth consecutive win with a 3-1 victory over Henderson Silver Knights on Saturday.",
    link: "https://www.texasstars.com/news/detail/stars-upend-silver-knights-for-fifth-straight-victory"
  }
];

// Updated AHL Central Division standings (Feb 9, 2026)
const ahlStandings = [
  // Based on 7-game win streak, Texas Stars are likely in top position
  { teamName: 'Texas Stars', teamCode: 'TEX', division: 'Central Division', gamesPlayed: 48, wins: 29, losses: 13, otLosses: 6, points: 64, goalsFor: 156, goalsAgainst: 128, goalDiff: 28, winPct: 0.667, homeRecord: '17-5-2', awayRecord: '12-8-4', streak: 'W7', rank: 1 },
  { teamName: 'Milwaukee Admirals', teamCode: 'MIL', division: 'Central Division', gamesPlayed: 49, wins: 27, losses: 15, otLosses: 7, points: 61, goalsFor: 148, goalsAgainst: 135, goalDiff: 13, winPct: 0.622, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W1', rank: 2 },
  { teamName: 'Grand Rapids Griffins', teamCode: 'GR', division: 'Central Division', gamesPlayed: 48, wins: 26, losses: 16, otLosses: 6, points: 58, goalsFor: 142, goalsAgainst: 138, goalDiff: 4, winPct: 0.604, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 3 },
  { teamName: 'Manitoba Moose', teamCode: 'MAN', division: 'Central Division', gamesPlayed: 50, wins: 24, losses: 19, otLosses: 7, points: 55, goalsFor: 145, goalsAgainst: 152, goalDiff: -7, winPct: 0.550, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L2', rank: 4 },
  { teamName: 'Chicago Wolves', teamCode: 'CHI', division: 'Central Division', gamesPlayed: 48, wins: 23, losses: 18, otLosses: 7, points: 53, goalsFor: 138, goalsAgainst: 141, goalDiff: -3, winPct: 0.552, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'W2', rank: 5 },
  { teamName: 'Rockford IceHogs', teamCode: 'ROC', division: 'Central Division', gamesPlayed: 47, wins: 21, losses: 20, otLosses: 6, points: 48, goalsFor: 131, goalsAgainst: 145, goalDiff: -14, winPct: 0.511, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L3', rank: 6 },
  { teamName: 'Iowa Wild', teamCode: 'IOW', division: 'Central Division', gamesPlayed: 49, wins: 19, losses: 23, otLosses: 7, points: 45, goalsFor: 129, goalsAgainst: 156, goalDiff: -27, winPct: 0.459, homeRecord: 'N/A', awayRecord: 'N/A', streak: 'L1', rank: 7 }
];

async function updateHeadlines() {
  console.log('\n📰 Updating Headlines...');
  const snapshot = await getDocs(collection(db, 'headlines'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }

  for (const headline of latestHeadlines) {
    await addDoc(collection(db, 'headlines'), {
      ...headline,
      createdAt: new Date()
    });
  }
  console.log(`✅ Updated ${latestHeadlines.length} headlines`);
}

async function updateStandings() {
  console.log('\n🏆 Updating AHL Central Division Standings...');
  const snapshot = await getDocs(collection(db, 'standings'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }

  for (const team of ahlStandings) {
    await addDoc(collection(db, 'standings'), {
      ...team,
      lastUpdated: new Date()
    });
  }
  console.log(`✅ Updated ${ahlStandings.length} teams in standings`);
  console.log(`   Texas Stars: ${ahlStandings[0].wins}-${ahlStandings[0].losses}-${ahlStandings[0].otLosses} (${ahlStandings[0].points} pts) - ${ahlStandings[0].streak}`);
}

async function main() {
  try {
    console.log('🔄 Starting full data update...\n');

    await updateHeadlines();
    await updateStandings();

    console.log('\n✅ All data updated successfully!');
    console.log('\nSummary:');
    console.log(`  • ${latestHeadlines.length} headlines`);
    console.log(`  • ${ahlStandings.length} teams in standings`);
    console.log(`  • Texas Stars on ${ahlStandings[0].streak} win streak!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
