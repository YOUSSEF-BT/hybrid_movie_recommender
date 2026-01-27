/**
 * User Preferences API Route
 * 
 * Handles updating user preferences, including onboarding completion.
 * Ready for FastAPI recommendation system integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  completedOnboarding: z.boolean().optional(),
  preferredGenres: z.array(z.number()).optional(), // Array of genre IDs
});

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    // Handle genre preferences separately
    const { preferredGenres, ...otherData } = validatedData;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...otherData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        completedOnboarding: validatedData.completedOnboarding || false,
      },
      include: {
        preferredGenres: true,
      },
    });

    // Update genre preferences if provided
    if (preferredGenres !== undefined) {
      // Delete existing genre preferences
      await prisma.userGenrePreference.deleteMany({
        where: { preferencesId: preferences.id },
      });

      // Add new genre preferences
      if (preferredGenres.length > 0) {
        await prisma.userGenrePreference.createMany({
          data: preferredGenres.map((genreId) => ({
            preferencesId: preferences.id,
            genreId,
          })),
        });
      }
    }

    // Fetch updated preferences with genres
    const updatedPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
      include: {
        preferredGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
