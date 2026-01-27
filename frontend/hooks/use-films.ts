/**
 * Films Hooks
 * 
 * React Query hooks for fetching and interacting with film data.
 * Supports anonymous users by saving likes to localStorage.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Film } from '@/types';
import { useAuth } from './use-auth';
import { saveAnonymousLike, getAnonymousLikes } from '@/lib/anonymous-user';

export type FilmFilters = {
  genre?: string;
  search?: string;
  limit?: number;
};

export function useFilms(filters?: FilmFilters) {
  return useQuery({
    queryKey: ['films', filters],
    queryFn: async (): Promise<Film[]> => {
      const params = new URLSearchParams();
      if (filters?.genre) params.set('genre', filters.genre);
      if (filters?.search) params.set('q', filters.search);
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const url = params.toString() ? `/api/films?${params.toString()}` : '/api/films';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch films');
      return response.json();
    },
  });
}

export function useLikeFilm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (film: Film) => {
      // If not logged in, save to localStorage
      if (!user) {
        const anonymousLikes = getAnonymousLikes();
        const isLiked = anonymousLikes.films.includes(film.id);
        saveAnonymousLike('films', film.id, !isLiked);
        return { liked: !isLiked };
      }

      // If logged in, save to database
      const response = await fetch('/api/films/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          filmId: film.id,
          tmdbId: (film as any).tmdbId ?? null,
          title: film.title,
          director: film.director ?? null,
          imageUrl: film.imageUrl ?? null,
          year: film.year ?? null,
          genre: film.genre ?? null,
        }),
      });

      if (!response.ok) throw new Error('Failed to like film');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['films'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
