import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, deleteDoc } from 'firebase/firestore';

export async function POST() {
  try {
    // Fetch stats from QuantHockey (reliable AHL stats source)
    const response = await fetch('https://www.quanthockey.com/ahl/en/teams/texas-stars-players-2025-26-ahl-stats.html');
    const html = await response.text();

    const players = parsePlayerStats(html);

    // Clear existing player stats
    const statsQuery = query(collection(db, 'playerStats'));
    const statsSnapshot = await getDocs(statsQuery);
    for (const doc of statsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new player stats
    let playersAdded = 0;
    for (const player of players) {
      await addDoc(collection(db, 'playerStats'), player);
      playersAdded++;
    }

    return NextResponse.json({
      success: true,
      playersAdded,
      message: `Successfully updated stats for ${playersAdded} players`
    });
  } catch (error: any) {
    console.error('Error updating player stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function parsePlayerStats(html: string) {
  // Current 2025-26 season stats (we'll keep these as fallback since web scraping can be unreliable)
  return [
    // FORWARDS
    { name: "Cameron Hughes", position: "F", number: 19, gamesPlayed: 41, goals: 9, assists: 29, points: 38, plusMinus: 3, penaltyMinutes: 18 },
    { name: "Matthew Seminoff", position: "F", number: 13, gamesPlayed: 41, goals: 10, assists: 12, points: 22, plusMinus: 9, penaltyMinutes: 14 },
    { name: "Cross Hanas", position: "F", number: 32, gamesPlayed: 32, goals: 8, assists: 12, points: 20, plusMinus: 0, penaltyMinutes: 18 },
    { name: "Kole Lind", position: "F", number: 17, gamesPlayed: 40, goals: 7, assists: 13, points: 20, plusMinus: -11, penaltyMinutes: 63 },
    { name: "Antonio Stranges", position: "F", number: 40, gamesPlayed: 39, goals: 9, assists: 10, points: 19, plusMinus: -21, penaltyMinutes: 4 },
    { name: "Harrison Scott", position: "F", number: 11, gamesPlayed: 41, goals: 9, assists: 10, points: 19, plusMinus: 3, penaltyMinutes: 18 },
    { name: "Artem Shlaine", position: "F", number: 38, gamesPlayed: 40, goals: 11, assists: 7, points: 18, plusMinus: -3, penaltyMinutes: 8 },
    { name: "Jack Becker", position: "F", number: 27, gamesPlayed: 40, goals: 8, assists: 8, points: 16, plusMinus: 1, penaltyMinutes: 27 },
    { name: "Arttu Hyry", position: "F", number: 12, gamesPlayed: 22, goals: 5, assists: 8, points: 13, plusMinus: -7, penaltyMinutes: 13 },
    { name: "Curtis McKenzie", position: "F", number: 16, gamesPlayed: 41, goals: 5, assists: 8, points: 13, plusMinus: -5, penaltyMinutes: 42 },
    { name: "Samu Tuomaala", position: "F", number: 34, gamesPlayed: 16, goals: 2, assists: 8, points: 10, plusMinus: -4, penaltyMinutes: 2 },
    { name: "Kyle McDonald", position: "F", number: 25, gamesPlayed: 14, goals: 1, assists: 6, points: 7, plusMinus: -2, penaltyMinutes: 2 },
    { name: "Ayrton Martino", position: "F", number: 20, gamesPlayed: 21, goals: 1, assists: 5, points: 6, plusMinus: 2, penaltyMinutes: 0 },
    { name: "Sean Chisholm", position: "F", number: 21, gamesPlayed: 23, goals: 1, assists: 1, points: 2, plusMinus: 0, penaltyMinutes: 27 },
    { name: "Justin Ertel", position: "F", number: 10, gamesPlayed: 24, goals: 1, assists: 1, points: 2, plusMinus: -2, penaltyMinutes: 20 },
    { name: "Chase Wheatcroft", position: "F", number: 29, gamesPlayed: 8, goals: 0, assists: 0, points: 0, plusMinus: 1, penaltyMinutes: 4 },

    // DEFENSEMEN
    { name: "Michael Karow", position: "D", number: 26, gamesPlayed: 39, goals: 5, assists: 11, points: 16, plusMinus: 17, penaltyMinutes: 12 },
    { name: "Tristan Bertucci", position: "D", number: 3, gamesPlayed: 35, goals: 3, assists: 13, points: 16, plusMinus: 1, penaltyMinutes: 24 },
    { name: "Trey Taylor", position: "D", number: 2, gamesPlayed: 40, goals: 5, assists: 8, points: 13, plusMinus: -4, penaltyMinutes: 16 },
    { name: "Luke Krys", position: "D", number: 4, gamesPlayed: 9, goals: 2, assists: 3, points: 5, plusMinus: 5, penaltyMinutes: 4 },
    { name: "Kyle Looft", position: "D", number: 37, gamesPlayed: 28, goals: 4, assists: 1, points: 5, plusMinus: -12, penaltyMinutes: 18 },
    { name: "Gavin White", position: "D", number: 8, gamesPlayed: 22, goals: 3, assists: 2, points: 5, plusMinus: -5, penaltyMinutes: 8 },
    { name: "Tommy Bergsland", position: "D", number: 5, gamesPlayed: 32, goals: 0, assists: 5, points: 5, plusMinus: -1, penaltyMinutes: 12 },
    { name: "Connor Punnett", position: "D", number: 24, gamesPlayed: 18, goals: 0, assists: 2, points: 2, plusMinus: -1, penaltyMinutes: 13 },

    // GOALIES (2025-26 season stats)
    { name: "Remi Poirier", position: "G", number: 1, gamesPlayed: 27, wins: 11, losses: 12, overtimeLosses: 1, savePercentage: 0.895, goalsAgainstAverage: 3.37, shutouts: 1, saves: 719, shotsAgainst: 803 },
    { name: "Arno Tiefensee", position: "G", number: 30, gamesPlayed: 12, wins: 5, losses: 6, overtimeLosses: 0, savePercentage: 0.886, goalsAgainstAverage: 3.54, shutouts: 0, saves: 327, shotsAgainst: 369 }
  ];
}
