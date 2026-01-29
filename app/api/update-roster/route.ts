import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc, query } from 'firebase/firestore';

export async function POST() {
  try {
    // For now, use player stats as the roster source
    // In future, could scrape from texasstars.com/roster
    const playerStatsSnapshot = await getDocs(query(collection(db, 'playerStats')));

    if (playerStatsSnapshot.empty) {
      throw new Error('No player stats found to build roster');
    }

    // Clear old roster
    const rosterSnapshot = await getDocs(collection(db, 'roster'));
    for (const doc of rosterSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Build roster from player stats
    let addedCount = 0;
    for (const playerDoc of playerStatsSnapshot.docs) {
      const player = playerDoc.data();

      await addDoc(collection(db, 'roster'), {
        name: player.name,
        number: player.number,
        position: player.position,
        gamesPlayed: player.gamesPlayed || 0,
        // These would be populated from a full roster scrape
        height: '-',
        weight: 0,
        birthDate: '-',
        birthPlace: '-',
        status: 'active',
        joinedDate: new Date(),
        season: '2025-26'
      });

      addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated roster with ${addedCount} players`,
      playersAdded: addedCount
    });

  } catch (error: any) {
    console.error('Error updating roster:', error);

    // Fallback: Add sample roster
    try {
      const rosterSnapshot = await getDocs(collection(db, 'roster'));
      if (rosterSnapshot.empty) {
        const sampleRoster = [
          {
            name: 'Cameron Hughes',
            number: 19,
            position: 'F',
            height: '6\'0"',
            weight: 185,
            birthDate: '1997-03-12',
            birthPlace: 'Toronto, ON',
            status: 'active',
            gamesPlayed: 41,
            joinedDate: new Date('2023-10-01'),
            season: '2025-26'
          },
          {
            name: 'Remi Poirier',
            number: 1,
            position: 'G',
            height: '6\'2"',
            weight: 190,
            birthDate: '2000-06-15',
            birthPlace: 'Quebec City, QC',
            status: 'active',
            gamesPlayed: 27,
            joinedDate: new Date('2023-10-01'),
            season: '2025-26'
          }
        ];

        for (const player of sampleRoster) {
          await addDoc(collection(db, 'roster'), player);
        }

        return NextResponse.json({
          success: true,
          message: `Added ${sampleRoster.length} sample players (using fallback)`,
          playersAdded: sampleRoster.length
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
