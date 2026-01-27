/**
 * The Movie Database (TMDB) API Client
 * 
 * Handles fetching movies, images, and trailers from TMDB API.
 */

const TMDB_API_KEY = 'ca79d74155ffa3d98b9ef17ca1be74f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  director?: string;
  videos?: {
    results: Array<{
      key: string;
      type: string;
      site: string;
    }>;
  };
}

export interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

/**
 * Get movie genres mapping from TMDB (id -> name)
 */
export async function getMovieGenres(): Promise<Record<number, string>> {
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

/**
 * Get popular movies from TMDB
 */
export async function getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movies from TMDB');
  }

  return response.json();
}

/**
 * Get top rated movies from TMDB
 */
export async function getTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch top rated movies from TMDB');
  }

  return response.json();
}

/**
 * Get movie details including videos (trailers)
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movie details from TMDB');
  }

  return response.json();
}

/**
 * Get movie poster URL
 */
export function getPosterUrl(posterPath: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!posterPath) {
    return 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

/**
 * Get movie backdrop URL
 */
export function getBackdropUrl(backdropPath: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!backdropPath) {
    return 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}

/**
 * Get YouTube trailer URL from TMDB video key
 */
export function getTrailerUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`;
}
