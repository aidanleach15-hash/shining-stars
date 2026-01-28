import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function POST() {
  try {
    const penaltiesQuery = query(collection(db, 'penalties'));
    const penaltiesSnapshot = await getDocs(penaltiesQuery);

    for (const doc of penaltiesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    return NextResponse.json({
      success: true,
      message: 'All penalties cleared'
    });
  } catch (error: any) {
    console.error('Error clearing penalties:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
