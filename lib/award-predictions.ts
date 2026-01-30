import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

export async function awardPredictionsForGame(gameId: string, starsScore: number, opponentScore: number) {
  try {
    // Determine the winner
    const starsWon = starsScore > opponentScore;
    const winner = starsWon ? 'stars' : 'opponent';

    // Get all predictions for this game that haven't been awarded
    const predictionsQuery = query(
      collection(db, 'predictions'),
      where('gameId', '==', gameId),
      where('awarded', '==', false)
    );

    const predictionsSnapshot = await getDocs(predictionsQuery);
    let awardedCount = 0;

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
        awardedCount++;
      }
    }

    return { success: true, awardedCount };
  } catch (error) {
    console.error('Error awarding predictions for game:', gameId, error);
    return { success: false, error };
  }
}

export async function awardAllPendingPredictions() {
  try {
    // Get all final games
    const gamesQuery = query(
      collection(db, 'schedule'),
      where('status', '==', 'final')
    );

    const gamesSnapshot = await getDocs(gamesQuery);
    let totalAwarded = 0;

    for (const gameDoc of gamesSnapshot.docs) {
      const game = gameDoc.data();
      const gameId = gameDoc.id;

      // Check if game has scores
      if (game.starsScore !== undefined && game.opponentScore !== undefined) {
        const result = await awardPredictionsForGame(gameId, game.starsScore, game.opponentScore);
        if (result.success) {
          totalAwarded += result.awardedCount || 0;
        }
      }
    }

    return { success: true, totalAwarded };
  } catch (error) {
    console.error('Error awarding all predictions:', error);
    return { success: false, error };
  }
}
