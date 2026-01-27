/**
 * Films API Route
 * 
 * Handles fetching films with optional search and genre filters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre');
    const q = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const where: Prisma.FilmWhereInput = {};
    if (genre) {
      where.genre = { equals: genre, mode: 'insensitive' };
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { director: { contains: q, mode: 'insensitive' } },
        { genre: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Fetch from database
    const films = await prisma.film.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(films);
  } catch (error) {
    console.error('Films fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch films' },
      { status: 500 }
    );
  }
}
