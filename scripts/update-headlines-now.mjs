import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

async function updateHeadlines() {
  try {
    console.log('🔄 Clearing old headlines...');
    const snapshot = await getDocs(collection(db, 'headlines'));
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    console.log('✅ Cleared old headlines');

    console.log('📰 Adding new headlines...');
    for (const headline of latestHeadlines) {
      await addDoc(collection(db, 'headlines'), {
        ...headline,
        createdAt: new Date()
      });
      console.log(`   ✓ Added: ${headline.title}`);
    }

    console.log('✅ All headlines updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateHeadlines();
