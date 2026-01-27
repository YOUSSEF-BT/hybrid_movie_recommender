/**
 * Shared TypeScript Types
 * 
 * Centralized type definitions for the application.
 * Ready for FastAPI recommendation system integration.
 */

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Film = {
  id: string;
  title: string;
  director: string | null;
  genre: string | null;
  genres?: string[] | null;
  imageUrl: string | null;
  backdropUrl?: string | null;
  overview?: string | null;
  rating?: number | null;
  trailerUrl?: string | null;
  year: number | null;
  tmdbId?: number;
  createdAt?: Date;
};

export type UserPreferences = {
  id: string;
  userId: string;
  completedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse = {
  user: User | null;
  error: string | null;
};
