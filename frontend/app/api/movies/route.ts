/**
 * Movies API Route
 * 
 * Fetches movies from TMDB API and returns them in a format
 * compatible with our Film model.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPopularMovies, getTopRatedMovies, getPosterUrl } from '@/lib/tmdb';

async function getGenreMap(): Promise<Record<number, string>> {
  // Keep this local to avoid dev-server caching issues with Turbopack exports.
  const TMDB_API_KEY = 'ca79d74155ffa3d98b9ef17ca1be74f8';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  const response = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`,
    { next: { revalidate: 86400 } } // Cache for 24 hours
  );

  if (!response.ok) {
    throw new Error('Failed to fetch genres from TMDB');
  }

  const data = await response.json();
  const map: Record<number, string> = {};
  for (const g of data.genres || []) {
    map[g.id] = g.name;
  }
  return map;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'popular'; // 'popular' or 'top_rated'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const q = searchParams.get('q') || '';
    const genre = searchParams.get('genre') || '';

    const genreMap = await getGenreMap();

    // Fetch from TMDB
    const tmdbResponse = type === 'top_rated' 
      ? await getTopRatedMovies(page)
      : await getPopularMovies(page);

    // Transform TMDB movies to our Film format
    const films = tmdbResponse.results.map((movie) => {
      const genres = (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);
      return {
        id: movie.id.toString(),
        title: movie.title,
        director: null, // TMDB doesn't provide director in list endpoint
        genre: genres.length > 0 ? genres[0] : null,
        genres,
        imageUrl: getPosterUrl(movie.poster_path),
        backdropUrl: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : null,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
        overview: movie.overview,
        rating: movie.vote_average,
        tmdbId: movie.id,
      };
    });

    const filtered = films.filter((m) => {
      const okQ = q
        ? m.title.toLowerCase().includes(q.toLowerCase()) ||
          (m.overview || '').toLowerCase().includes(q.toLowerCase())
        : true;
      const okGenre = genre
        ? (m.genres || []).some((g: string) => g.toLowerCase() === genre.toLowerCase())
        : true;
      return okQ && okGenre;
    });

    return NextResponse.json({
      films: filtered,
      page: tmdbResponse.page,
      totalPages: tmdbResponse.total_pages,
      totalResults: tmdbResponse.total_results,
    });
  } catch (error) {
    console.error('Movies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
