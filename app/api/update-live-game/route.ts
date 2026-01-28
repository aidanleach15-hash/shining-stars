import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Clear existing live game data
    const gameQuery = query(collection(db, 'liveGame'));
    const gameSnapshot = await getDocs(gameQuery);
    for (const doc of gameSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new live game data
    const liveGameData = {
      homeTeam: body.homeTeam || 'Texas Stars',
      awayTeam: body.awayTeam || 'Opponent',
      homeScore: body.homeScore || 0,
      awayScore: body.awayScore || 0,
      period: body.period || '1st Period',
      timeRemaining: body.timeRemaining || '20:00',
      homeShotsOnGoal: body.homeShotsOnGoal || 0,
      awayShotsOnGoal: body.awayShotsOnGoal || 0,
      isLive: body.isLive !== undefined ? body.isLive : true,
      gameStatus: body.gameStatus || 'In Progress',
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, 'liveGame'), liveGameData);

    return NextResponse.json({
      success: true,
      message: 'Live game updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating live game:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
