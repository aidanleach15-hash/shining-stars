#!/usr/bin/env node

// Manual script to update headlines directly in Firebase
const admin = require('firebase-admin');

// Initialize Firebase Admin (requires service account key)
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const latestHeadlines = [
  {
    title: "Dallas Stars Acquire Defenseman Jeremie Poirier from Calgary Flames",
    summary: "The Dallas Stars completed a trade, acquiring defenseman Jeremie Poirier from Calgary in exchange for defenseman Gavin White.",
    link: "https://www.texasstars.com/news/detail/dallas-stars-acquire-defenseman-jeremie-poirier-from-calgary-flames-for-defenseman-gavin-white",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Stars to Host Annual Pink in the Rink Weekend",
    summary: "The team announced upcoming Pink in the Rink Weekend presented by Baylor Scott & White on February 27-28 at 7pm.",
    link: "https://www.texasstars.com/news/detail/stars-to-host-annual-pink-in-the-rink-weekend",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Stars Upend Silver Knights for Fifth Straight Victory",
    summary: "Texas Stars defeated Henderson Silver Knights 3-1 Saturday, extending their winning streak to five games at H-E-B Center.",
    link: "https://www.texasstars.com/news/detail/stars-upend-silver-knights-for-fifth-straight-victory",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Stars Defeat Silver Knights in Overtime Classic",
    summary: "Texas Stars won 6-5 in overtime against Henderson Friday, with Artem Shlaine scoring the game-winning goal in dramatic fashion.",
    link: "https://www.texasstars.com/news/detail/stars-defeat-silver-knights-in-overtime-classic",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Stars Blank IceHogs in Third Straight Win",
    summary: "The team shut out Rockford IceHogs 5-0 on Friday at BMO Center, securing their third consecutive victory.",
    link: "https://www.texasstars.com/news/detail/stars-blank-icehogs-in-third-straight-win",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function updateHeadlines() {
  try {
    console.log('🔄 Clearing old headlines...');
    const snapshot = await db.collection('headlines').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('✅ Cleared old headlines');

    console.log('📰 Adding new headlines...');
    for (const headline of latestHeadlines) {
      await db.collection('headlines').add(headline);
      console.log(`   ✓ Added: ${headline.title}`);
    }

    console.log('✅ Headlines updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateHeadlines();
