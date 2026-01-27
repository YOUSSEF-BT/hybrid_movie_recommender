/**
 * Genres Hooks
 *
 * Fetches normalized genres from the database.
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export type Genre = {
  id: number;
  name: string;
};

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await fetch('/api/genres');
      if (!res.ok) throw new Error('Failed to fetch genres');
      return res.json();
    },
  });
}

