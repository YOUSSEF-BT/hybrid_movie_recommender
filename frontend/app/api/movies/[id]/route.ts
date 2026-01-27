/**
 * Movie Details API Route
 * 
 * Fetches detailed movie information including trailer from TMDB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getPosterUrl, getBackdropUrl, getTrailerUrl } from '@/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const movieId = parseInt(resolvedParams.id, 10);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    // Fetch movie details from TMDB
    const movieDetails = await getMovieDetails(movieId);

    // Find YouTube trailer
    const trailer = movieDetails.videos?.results.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    // Transform to our format
    const film = {
      id: movieDetails.id.toString(),
      title: movieDetails.title,
      director: null, // We'll need to fetch credits for director
      genre: movieDetails.genres.length > 0 ? movieDetails.genres[0].name : null,
      genres: movieDetails.genres.map((g) => g.name),
      imageUrl: getPosterUrl(movieDetails.poster_path, 'w780'),
      backdropUrl: getBackdropUrl(movieDetails.backdrop_path),
      year: movieDetails.release_date ? parseInt(movieDetails.release_date.split('-')[0]) : null,
      overview: movieDetails.overview,
      rating: movieDetails.vote_average,
      runtime: movieDetails.runtime,
      releaseDate: movieDetails.release_date,
      trailerUrl: trailer ? getTrailerUrl(trailer.key) : null,
      tmdbId: movieDetails.id,
    };

    return NextResponse.json(film);
  } catch (error) {
    console.error('Movie details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}
