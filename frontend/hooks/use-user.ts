/**
 * User Hooks
 * 
 * React Query hooks for fetching user data and preferences.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';

export function useUser() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/user', {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    enabled: !!user,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { completedOnboarding?: boolean; preferredGenres?: number[] }) => {
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
