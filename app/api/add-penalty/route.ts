import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const penaltyData = {
      team: body.team,
      player: body.player,
      infraction: body.infraction,
      minutes: body.minutes || 2,
      period: body.period,
      timeOfPenalty: body.timeOfPenalty,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, 'penalties'), penaltyData);

    return NextResponse.json({
      success: true,
      message: 'Penalty added successfully'
    });
  } catch (error: any) {
    console.error('Error adding penalty:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
