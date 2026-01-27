/**
 * Movies Hooks
 * 
 * React Query hooks for fetching movies from TMDB API.
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface Movie {
  id: string;
  title: string;
  director: string | null;
  genre: string | null;
  imageUrl: string;
  backdropUrl: string | null;
  year: number | null;
  overview: string | null;
  rating: number;
  runtime?: number;
  releaseDate?: string;
  genres?: string[];
  trailerUrl?: string | null;
  tmdbId: number;
}

export interface MoviesResponse {
  films: Movie[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export function useMovies(
  type: 'popular' | 'top_rated' = 'popular',
  page: number = 1,
  opts?: { q?: string; genre?: string }
) {
  return useQuery({
    queryKey: ['movies', type, page, opts?.q || '', opts?.genre || ''],
    queryFn: async (): Promise<MoviesResponse> => {
      const params = new URLSearchParams();
      params.set('type', type);
      params.set('page', page.toString());
      if (opts?.q) params.set('q', opts.q);
      if (opts?.genre) params.set('genre', opts.genre);
      const response = await fetch(`/api/movies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      return response.json();
    },
  });
}

export function useMovieDetails(movieId: string) {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const response = await fetch(`/api/movies/${movieId}`);
      if (!response.ok) throw new Error('Failed to fetch movie details');
      return response.json();
    },
    enabled: !!movieId,
  });
}
