/**
 * Film Like API Route
 * 
 * Handles liking/unliking films.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const likeSchema = z.object({
  filmId: z.string(),
  tmdbId: z.number().int().nullable().optional(),
  director: z.string().nullable().optional(),
  title: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  genre: z.string().nullable().optional(),
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
    const { filmId, tmdbId, title, director, imageUrl, year, genre } = likeSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // If tmdbId is provided, try to map to an existing DB film (seeded) so likes use DB ids.
      let mappedFilm = null;
      if (tmdbId !== null && tmdbId !== undefined) {
        // Use type assertion to work around Prisma TypeScript limitation with nullable Int fields
        const where = {
          tmdbId: tmdbId,
        } as Prisma.FilmWhereInput;
        const films = await tx.film.findMany({
          where,
          take: 1,
        });
        mappedFilm = films[0] || null;
      }
      const targetFilmId = mappedFilm?.id ?? filmId;

      // Check if already liked (handle both targetFilmId and original filmId defensively)
      const existingLike = await tx.userFilmLike.findFirst({
        where: {
          userId,
          OR: [{ filmId: targetFilmId }, { filmId }],
        },
      });

      if (existingLike) {
        // Unlike
        await tx.userFilmLike.delete({
          where: {
            id: existingLike.id,
          },
        });
        return { liked: false };
      }

      // Ensure film exists when liking (external ids come from API responses)
      const createData = {
        id: targetFilmId,
        title: title ?? 'Unknown Title',
        director: director ?? null,
        genre: genre ?? null,
        imageUrl: imageUrl ?? null,
        year: year ?? null,
        tmdbId: tmdbId ?? null,
      } as Prisma.FilmCreateInput;
      
      const updateData = {
        // Fill tmdbId if it was missing before
        tmdbId: tmdbId ?? undefined,
      } as Prisma.FilmUpdateInput;
      
      await tx.film.upsert({
        where: { id: targetFilmId },
        create: createData,
        update: updateData,
      });

      // Like
      await tx.userFilmLike.create({
        data: {
          userId,
          filmId: targetFilmId,
        },
      });

      return { liked: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Film like error:', error);
    return NextResponse.json(
      { error: 'Failed to like film' },
      { status: 500 }
    );
  }
}
