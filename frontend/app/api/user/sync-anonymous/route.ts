/**
 * Sync Anonymous Data API Route
 * 
 * Syncs anonymous user film likes from localStorage
 * to the database when user logs in.
 * Ready for FastAPI recommendation system integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const syncSchema = z.object({
  filmLikes: z.array(z.string()),
  preferences: z.object({}).optional(), // Reserved for future use
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filmLikes, preferences } = syncSchema.parse(body);

    // Sync film likes
    for (const filmId of filmLikes) {
      try {
        await prisma.userFilmLike.upsert({
          where: {
            userId_filmId: {
              userId,
              filmId,
            },
          },
          create: {
            userId,
            filmId,
          },
          update: {},
        });
      } catch (error) {
        // Ignore if film doesn't exist or already liked
        console.error(`Failed to sync film like ${filmId}:`, error);
      }
    }

    // Sync preferences if provided (reserved for future recommendation system)
    if (preferences) {
      // Future: Add preference syncing logic here when FastAPI backend is ready
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Sync anonymous data error:', error);
    return NextResponse.json(
      { error: 'Failed to sync anonymous data' },
      { status: 500 }
    );
  }
}
