/**
 * Recommendation Hooks
 *
 * Fetches recommendations from the FastAPI backend.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { Film } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_RECS_API_URL;

// Debug logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[Recommendations] BASE_URL:', BASE_URL);
  if (!BASE_URL) {
    console.warn('[Recommendations] NEXT_PUBLIC_RECS_API_URL is not set!');
  }
}

type RecommendationItem = {
  film: Film;
  score: number;
  reason?: string | null;
};

type RecommendationsResponse = {
  userId?: string | null;
  seedFilmId?: string | null;
  algorithm: string;
  items: RecommendationItem[];
};

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_RECS_API_URL is not set');
  }
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export function useUserRecommendations(
  userId: string | undefined,
  algorithm: 'content' | 'collab' | 'collab-item' | 'collab-user' | 'hybrid' = 'hybrid',
  k = 20,
  enabled = true
) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recs', 'user', userId, algorithm, k],
    queryFn: async () => {
      if (!BASE_URL) {
        const error = new Error('NEXT_PUBLIC_RECS_API_URL is not set. Please check your environment variables.');
        (error as any).type = 'config';
        throw error;
      }

      const url = buildUrl(`/recommendations/user/${userId}`, { algorithm, k });
      
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          const text = await resp.text();
          let errorMessage = `Failed to fetch recommendations: ${resp.status}`;
          try {
            const errorData = JSON.parse(text);
            if (errorData.detail) {
              errorMessage = `${resp.status}: ${errorData.detail}`;
            }
          } catch {
            if (text) {
              errorMessage = `${resp.status}: ${text}`;
            }
          }
          const error = new Error(errorMessage);
          (error as any).status = resp.status;
          (error as any).url = url;
          throw error;
        }
        return resp.json();
      } catch (error: any) {
        // Handle network errors (fetch failed completely)
        if (error.name === 'TypeError' || error.message?.includes('fetch')) {
          const networkError = new Error(
            `Network error: Could not connect to recommendation API at ${BASE_URL}. ` +
            `Please ensure the backend is running on ${BASE_URL}`
          );
          (networkError as any).type = 'network';
          (networkError as any).url = url;
          (networkError as any).baseUrl = BASE_URL;
          throw networkError;
        }
        throw error;
      }
    },
    enabled: enabled && !!userId,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (user has no likes) or config errors
      if (error?.status === 404 || error?.type === 'config') return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

export function useSimilarFilms(
  filmId: string | undefined,
  algorithm: 'content' | 'collab' | 'collab-item' | 'collab-user' | 'hybrid' = 'hybrid',
  k = 20,
  enabled = true
) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recs', 'similar', filmId, algorithm, k],
    queryFn: async () => {
      const url = buildUrl(`/recommendations/similar/${filmId}`, { algorithm, k });
      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to fetch similar films: ${resp.status} ${text}`);
      }
      return resp.json();
    },
    enabled: enabled && !!filmId,
  });
}

