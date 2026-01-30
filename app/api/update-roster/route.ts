import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, addDoc, query } from 'firebase/firestore';

export async function POST() {
  try {
    // Texas Stars 2025-26 Roster Data
    const roster2025_26 = [
      // GOALIES
      { name: 'Ben Kraws', number: 31, position: 'G', height: '6\'5"', weight: 194, birthDate: '2000-08-02', birthPlace: 'Cranbury Township, NJ', status: 'active', gamesPlayed: 0 },
      { name: 'Rémi Poirier', number: 1, position: 'G', height: '6\'2"', weight: 201, birthDate: '2001-10-06', birthPlace: 'Farnham, QC', status: 'active', gamesPlayed: 0 },
      { name: 'Arno Tiefensee', number: 35, position: 'G', height: '6\'4"', weight: 212, birthDate: '2002-05-01', birthPlace: 'Weißwasser, Germany', status: 'active', gamesPlayed: 0 },

      // DEFENSEMEN
      { name: 'Thomas Bergsland', number: 44, position: 'D', height: '6\'3"', weight: 185, birthDate: '2001-03-23', birthPlace: 'Plymouth, MN', status: 'active', gamesPlayed: 0 },
      { name: 'Tristan Bertucci', number: 73, position: 'D', height: '6\'2"', weight: 179, birthDate: '2005-07-12', birthPlace: 'Vaughan, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Kyle Capobianco', number: 71, position: 'D', height: '6\'2"', weight: 196, birthDate: '1997-08-13', birthPlace: 'Mississauga, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Aidan Hreschuk', number: 6, position: 'D', height: '5\'11"', weight: 187, birthDate: '2003-02-19', birthPlace: 'Long Beach, CA', status: 'active', gamesPlayed: 0 },
      { name: 'Michael Karow', number: 4, position: 'D', height: '6\'2"', weight: 201, birthDate: '1998-12-18', birthPlace: 'Green Bay, WI', status: 'active', gamesPlayed: 0 },
      { name: 'Vladislav Kolyachonok', number: 23, position: 'D', height: '6\'2"', weight: 194, birthDate: '2001-05-26', birthPlace: 'Minsk, Belarus', status: 'active', gamesPlayed: 0 },
      { name: 'Luke Krys', number: 5, position: 'D', height: '6\'2"', weight: 187, birthDate: '2000-09-27', birthPlace: 'Ridgefield, CT', status: 'active', gamesPlayed: 0 },
      { name: 'Christian Kyrou', number: 55, position: 'D', height: '5\'10"', weight: 172, birthDate: '2003-09-16', birthPlace: 'Komoka, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Kyle Looft', number: 3, position: 'D', height: '6\'4"', weight: 216, birthDate: '1998-06-27', birthPlace: 'Mankato, MN', status: 'active', gamesPlayed: 0 },
      { name: 'Connor Punnett', number: 45, position: 'D', height: '6\'2"', weight: 196, birthDate: '2003-06-16', birthPlace: 'Huntsville, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Trey Taylor', number: 24, position: 'D', height: '6\'2"', weight: 190, birthDate: '2002-02-04', birthPlace: 'Richmond, BC', status: 'active', gamesPlayed: 0 },
      { name: 'Gavin White', number: 2, position: 'D', height: '6\'0"', weight: 185, birthDate: '2002-11-12', birthPlace: 'Brockville, ON', status: 'active', gamesPlayed: 0 },

      // FORWARDS
      { name: 'Nathan Bastian', number: 14, position: 'F', height: '6\'4"', weight: 205, birthDate: '1997-12-06', birthPlace: 'Kitchener, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Jack Becker', number: 28, position: 'F', height: '6\'4"', weight: 216, birthDate: '1997-06-24', birthPlace: 'Duluth, MN', status: 'active', gamesPlayed: 0 },
      { name: 'Sean Chisholm', number: 26, position: 'F', height: '6\'1"', weight: 190, birthDate: '2001-01-26', birthPlace: 'Caledonia, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Justin Ertel', number: 27, position: 'F', height: '6\'2"', weight: 187, birthDate: '2003-05-27', birthPlace: 'Kitchener, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Cross Hanas', number: 38, position: 'F', height: '6\'1"', weight: 172, birthDate: '2002-01-05', birthPlace: 'Dallas, TX', status: 'active', gamesPlayed: 0 },
      { name: 'Emil Hemming', number: 46, position: 'F', height: '6\'2"', weight: 194, birthDate: '2006-06-27', birthPlace: 'Vaasa, Finland', status: 'active', gamesPlayed: 0 },
      { name: 'Cameron Hughes', number: 19, position: 'F', height: '6\'0"', weight: 183, birthDate: '1996-10-09', birthPlace: 'Edmonton, AB', status: 'active', gamesPlayed: 0 },
      { name: 'Arttu Hyry', number: 18, position: 'F', height: '6\'2"', weight: 209, birthDate: '2001-04-06', birthPlace: 'Oulu, Finland', status: 'active', gamesPlayed: 0 },
      { name: 'Kole Lind', number: 16, position: 'F', height: '6\'1"', weight: 179, birthDate: '1998-10-16', birthPlace: 'Swift Current, SK', status: 'active', gamesPlayed: 0 },
      { name: 'Ayrton Martino', number: 48, position: 'F', height: '5\'11"', weight: 161, birthDate: '2002-09-28', birthPlace: 'Toronto, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Kyle McDonald', number: 49, position: 'F', height: '6\'5"', weight: 212, birthDate: '2002-02-05', birthPlace: 'Ottawa, ON', status: 'active', gamesPlayed: 0 },
      { name: 'Curtis McKenzie', number: 17, position: 'F', height: '6\'2"', weight: 205, birthDate: '1991-02-21', birthPlace: 'Burnaby, BC', status: 'active', gamesPlayed: 0 },
      { name: 'Harrison Scott', number: 41, position: 'F', height: '6\'0"', weight: 185, birthDate: '2000-09-27', birthPlace: 'San Jose, CA', status: 'active', gamesPlayed: 0 },
      { name: 'Matthew Seminoff', number: 10, position: 'F', height: '5\'11"', weight: 181, birthDate: '2003-12-27', birthPlace: 'Coquitlam, BC', status: 'active', gamesPlayed: 0 },
      { name: 'Artem Shlaine', number: 47, position: 'F', height: '6\'1"', weight: 165, birthDate: '2002-03-07', birthPlace: 'Moscow, Russia', status: 'active', gamesPlayed: 0 },
      { name: 'Antonio Stranges', number: 11, position: 'F', height: '5\'11"', weight: 185, birthDate: '2002-02-05', birthPlace: 'Plymouth, MI', status: 'active', gamesPlayed: 0 },
      { name: 'Samu Tuomaala', number: 20, position: 'F', height: '5\'11"', weight: 190, birthDate: '2003-01-08', birthPlace: 'Oulu, Finland', status: 'active', gamesPlayed: 0 },
      { name: 'Chase Wheatcroft', number: 22, position: 'F', height: '6\'3"', weight: 183, birthDate: '2002-05-28', birthPlace: 'Calgary, AB', status: 'active', gamesPlayed: 0 }
    ];

    // Clear old roster
    const rosterSnapshot = await getDocs(collection(db, 'roster'));
    for (const doc of rosterSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add 2025-26 roster
    for (const player of roster2025_26) {
      await addDoc(collection(db, 'roster'), {
        ...player,
        joinedDate: new Date(),
        season: '2025-26'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated roster with ${roster2025_26.length} players for 2025-26 season`,
      playersAdded: roster2025_26.length
    });

  } catch (error: any) {
    console.error('Error updating roster:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
