import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

export async function POST() {
  try {
    // Get all final games that haven't been processed
    const gamesQuery = query(
      collection(db, 'schedule'),
      where('status', '==', 'final')
    );

    const gamesSnapshot = await getDocs(gamesQuery);

    let processedCount = 0;

    for (const gameDoc of gamesSnapshot.docs) {
      const game = gameDoc.data();
      const gameId = gameDoc.id;

      // Check if game has scores
      if (game.starsScore === undefined || game.opponentScore === undefined) {
        continue;
      }

      // Determine the winner
      const starsWon = game.starsScore > game.opponentScore;
      const winner = starsWon ? 'stars' : 'opponent';

      // Get all predictions for this game that haven't been awarded
      const predictionsQuery = query(
        collection(db, 'predictions'),
        where('gameId', '==', gameId),
        where('awarded', '==', false)
      );

      const predictionsSnapshot = await getDocs(predictionsQuery);

      for (const predictionDoc of predictionsSnapshot.docs) {
        const prediction = predictionDoc.data();

        // Check if prediction was correct
        const isCorrect = prediction.predictedWinner === winner;

        // Update prediction as awarded
        await updateDoc(doc(db, 'predictions', predictionDoc.id), {
          awarded: true,
          gameStatus: 'final',
          correct: isCorrect
        });

        // If correct, award pucks and increment correct predictions
        if (isCorrect) {
          const userStatsRef = doc(db, 'userStats', prediction.userId);
          await updateDoc(userStatsRef, {
            pucks: increment(5),
            correctPredictions: increment(1)
          });
          processedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} correct predictions`,
      processedCount
    });

  } catch (error) {
    console.error('Error awarding predictions:', error);
    return NextResponse.json(
      { error: 'Failed to award predictions' },
      { status: 500 }
    );
  }
}
