import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export async function POST() {
  try {
    // Clear old games
    const gamesQuery = collection(db, 'games');
    const gamesSnapshot = await getDocs(gamesQuery);
    for (const doc of gamesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add tonight's game with EXACT time
    await addDoc(collection(db, 'games'), {
      opponent: 'HENDERSON SILVER KNIGHTS',
      location: 'H-E-B Center at Cedar Park',
      isHome: true,
      date: new Date('2026-01-31T19:00:00-06:00'), // 7:00 PM CST EXACTLY
      time: '7:00 PM CT',
      bettingOdds: {
        starsMoneyline: '-135',
        opponentMoneyline: '+115',
        overUnder: '6.5',
        spread: '-1.5'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Added tonight\'s game at 7:00 PM CST'
    });
  } catch (error: any) {
    console.error('Error adding game:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
