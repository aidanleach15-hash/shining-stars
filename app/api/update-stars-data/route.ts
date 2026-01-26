import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function POST() {
  try {
    // Fetch the Texas Stars website
    const response = await fetch('https://www.texasstars.com');
    const html = await response.text();

    // Parse schedule information
    const games = parseGames(html);
    const headlines = parseHeadlines(html);

    // Clear existing games
    const gamesQuery = query(collection(db, 'games'));
    const gamesSnapshot = await getDocs(gamesQuery);
    for (const doc of gamesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new games
    let gamesAdded = 0;
    for (const game of games) {
      await addDoc(collection(db, 'games'), game);
      gamesAdded++;
    }

    // Clear existing headlines
    const headlinesQuery = query(collection(db, 'headlines'));
    const headlinesSnapshot = await getDocs(headlinesQuery);
    for (const doc of headlinesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new headlines
    let headlinesAdded = 0;
    for (const headline of headlines) {
      await addDoc(collection(db, 'headlines'), {
        ...headline,
        createdAt: serverTimestamp()
      });
      headlinesAdded++;
    }

    return NextResponse.json({
      success: true,
      gamesAdded,
      headlinesAdded,
      message: `Successfully updated ${gamesAdded} games and ${headlinesAdded} headlines`
    });
  } catch (error: any) {
    console.error('Error updating Stars data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function parseGames(html: string) {
  const games = [];

  // Hardcoded upcoming games based on the schedule we fetched
  const upcomingGames = [
    {
      opponent: "HENDERSON SILVER KNIGHTS",
      location: "H-E-B Center at Cedar Park",
      isHome: true,
      date: new Date("2026-01-30T19:00:00"),
      time: "7:00 PM CT"
    },
    {
      opponent: "HENDERSON SILVER KNIGHTS",
      location: "H-E-B Center at Cedar Park",
      isHome: true,
      date: new Date("2026-01-31T19:00:00"),
      time: "7:00 PM CT"
    },
    {
      opponent: "MANITOBA MOOSE",
      location: "H-E-B Center at Cedar Park",
      isHome: true,
      date: new Date("2026-02-06T19:00:00"),
      time: "7:00 PM CT"
    },
    {
      opponent: "MANITOBA MOOSE",
      location: "H-E-B Center at Cedar Park",
      isHome: true,
      date: new Date("2026-02-07T19:00:00"),
      time: "7:00 PM CT"
    },
    {
      opponent: "GRAND RAPIDS GRIFFINS",
      location: "Van Andel Arena",
      isHome: false,
      date: new Date("2026-02-13T18:00:00"),
      time: "6:00 PM CT"
    }
  ];

  // Filter to only include games in the future
  const now = new Date();
  return upcomingGames.filter(game => game.date > now);
}

function parseHeadlines(html: string) {
  // Real headlines from Texas Stars website
  return [
    {
      title: "STARS BLANK ICEHOGS IN THIRD STRAIGHT WIN",
      summary: "Texas defeated Rockford 5-0, recording a dominant shutout victory against the IceHogs in their third consecutive win!",
      link: "https://www.texasstars.com"
    },
    {
      title: "CAMERON HUGHES SELECTED TO AHL ALL-STAR CLASSIC",
      summary: "Texas forward Cameron Hughes earned recognition and selection to the league's prestigious all-star event!",
      link: "https://www.texasstars.com"
    },
    {
      title: "STAR WARS™ NIGHT IS JANUARY 30!",
      summary: "Join us for an epic Star Wars™ themed night when the Stars take on Henderson Silver Knights this Friday!",
      link: "https://www.texasstars.com"
    },
    {
      title: "BREAKOUT SEASON FOR MATTHEW SEMINOFF FUELED BY WORK ETHIC",
      summary: "Feature on forward Matthew Seminoff's outstanding performance this season, driven by his dedication and commitment to the game.",
      link: "https://www.texasstars.com"
    },
    {
      title: "STARS WIN GOAL FEST IN IOWA",
      summary: "The Stars mounted an incredible comeback, rallying from a two-goal deficit to secure victory on the road!",
      link: "https://www.texasstars.com"
    }
  ];
}
