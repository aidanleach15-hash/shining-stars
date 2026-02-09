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

// Simulate a live game - Texas Stars vs Manitoba Moose
const liveGameData = {
  homeTeam: 'Texas Stars',
  awayTeam: 'Manitoba Moose',
  homeScore: 3,
  awayScore: 2,
  period: '2nd Period',
  timeRemaining: '12:45',
  homeShotsOnGoal: 18,
  awayShotsOnGoal: 15,
  isLive: true,
  gameStatus: 'In Progress',
  lastUpdated: new Date().toISOString()
};

async function setupLiveGame() {
  try {
    console.log('🏒 Setting up LIVE GAME simulation...\n');

    // Clear any existing live games
    const liveGameSnapshot = await getDocs(collection(db, 'liveGame'));
    for (const doc of liveGameSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log('✅ Cleared old live game data');

    // Add the new live game
    await addDoc(collection(db, 'liveGame'), liveGameData);
    console.log('✅ Live game added to database\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('           🔴 LIVE GAME IN PROGRESS 🔴');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`  ${liveGameData.homeTeam} vs ${liveGameData.awayTeam}`);
    console.log(`  Score: ${liveGameData.homeScore} - ${liveGameData.awayScore}`);
    console.log(`  Period: ${liveGameData.period}`);
    console.log(`  Time Remaining: ${liveGameData.timeRemaining}`);
    console.log(`  Shots on Goal: ${liveGameData.homeShotsOnGoal} - ${liveGameData.awayShotsOnGoal}`);
    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n🌐 Game Day Page Ready!');
    console.log('   Visit: https://shiningstars-lac.vercel.app/gameday');
    console.log('\n💡 TIP: The page will auto-update every 10 seconds');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupLiveGame();
