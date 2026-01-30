import { NextResponse } from 'next/server';
import { awardAllPendingPredictions } from '@/lib/award-predictions';

export async function POST() {
  try {
    const result = await awardAllPendingPredictions();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Awarded ${result.totalAwarded} correct predictions`,
        totalAwarded: result.totalAwarded
      });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Error awarding predictions:', error);
    return NextResponse.json(
      { error: 'Failed to award predictions' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
