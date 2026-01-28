import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc, addDoc } from 'firebase/firestore';

export async function POST() {
  try {
    // Clear existing team stats
    const statsQuery = query(collection(db, 'teamStats'));
    const statsSnapshot = await getDocs(statsQuery);
    for (const doc of statsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Texas Stars 2025-26 season stats (as of January 2026)
    // Source: AHL official standings
    const teamStats = {
      wins: 18,
      losses: 17,
      overtimeLosses: 6,
      points: 42,
      goalsFor: 123,
      goalsAgainst: 140,
      homeRecord: '11-7-3',
      awayRecord: '7-10-3',
      streak: 'W2',
      lastUpdated: new Date().toISOString()
    };

    await addDoc(collection(db, 'teamStats'), teamStats);

    return NextResponse.json({
      success: true,
      message: 'Team stats updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating team stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
