// Sample script to add news data to Firestore
// To use this, you would need to set up Firebase Admin SDK
// For now, you can manually add data through Firebase Console

// Example game data structure:
const sampleGame = {
  opponent: "CHICAGO WOLVES",
  location: "H-E-B Center at Cedar Park",
  isHome: true,
  date: new Date("2026-02-15T19:00:00"), // Set your game date/time
  time: "7:00 PM CT"
};

// Example headline data structure:
const sampleHeadlines = [
  {
    title: "STARS CLINCH PLAYOFF SPOT",
    summary: "The Texas Stars have officially clinched a spot in the 2026 Calder Cup Playoffs with their victory over the Wolves!",
    link: "https://www.texasstars.com",
    createdAt: new Date()
  },
  {
    title: "ROOKIE SENSATION SCORES HAT TRICK",
    summary: "First-year forward lights up the scoreboard with three goals in dominant home win.",
    link: "https://www.texasstars.com",
    createdAt: new Date()
  },
  {
    title: "UPCOMING HOMESTAND ANNOUNCED",
    summary: "The Stars return home for a crucial three-game series at H-E-B Center starting this weekend.",
    link: "https://www.texasstars.com",
    createdAt: new Date()
  }
];

console.log("=".repeat(60));
console.log("TEXAS STARS - SAMPLE DATA STRUCTURES");
console.log("=".repeat(60));
console.log("\nTo add this data to your Firestore database:");
console.log("1. Go to Firebase Console: https://console.firebase.google.com");
console.log("2. Select your project: shining-stars-56732");
console.log("3. Go to Firestore Database\n");

console.log("\n--- ADD A GAME ---");
console.log("Collection: 'games'");
console.log("Add document with these fields:");
console.log(JSON.stringify(sampleGame, null, 2));

console.log("\n--- ADD HEADLINES ---");
console.log("Collection: 'headlines'");
console.log("Add documents with these fields:");
console.log(JSON.stringify(sampleHeadlines, null, 2));

console.log("\n" + "=".repeat(60));
console.log("After adding data, visit: http://localhost:3000/news");
console.log("=".repeat(60));
