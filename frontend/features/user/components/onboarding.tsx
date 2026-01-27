/**
 * Onboarding Component
 * 
 * Multi-step onboarding for users to select favorite genres and films.
 * This helps the recommendation system understand user preferences.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdatePreferences, useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { useGenres } from '@/hooks/use-genres';
import { useFilms, useLikeFilm } from '@/hooks/use-films';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Film } from '@/types';

type OnboardingStep = 'genres' | 'films' | 'complete';

export function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: userData } = useUser();
  const updatePreferences = useUpdatePreferences();
  const { data: genres = [], isLoading: genresLoading } = useGenres();
  const { data: films = [], isLoading: filmsLoading } = useFilms({ limit: 50 });
  const likeFilm = useLikeFilm();

  const [step, setStep] = useState<OnboardingStep>('genres');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedFilms, setSelectedFilms] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing preferences if any
  useEffect(() => {
    if (userData?.preferences?.preferredGenres) {
      const genreIds = userData.preferences.preferredGenres.map(
        (pg: { genre: { id: number } }) => pg.genre.id
      );
      setSelectedGenres(genreIds);
    }
  }, [userData]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleFilm = async (film: Film) => {
    const filmId = film.tmdbId?.toString() || film.id;
    const isSelected = selectedFilms.includes(filmId);

    if (isSelected) {
      setSelectedFilms((prev) => prev.filter((id) => id !== filmId));
    } else {
      setSelectedFilms((prev) => [...prev, filmId]);
      // Also like the film in the system
      if (user) {
        try {
          await likeFilm.mutateAsync({
            id: filmId,
            title: film.title,
            director: film.director ?? null,
            genre: film.genre ?? null,
            imageUrl: film.imageUrl ?? null,
            year: film.year ?? null,
            tmdbId: film.tmdbId,
          });
        } catch (error) {
          console.error('Failed to like film:', error);
        }
      }
    }
  };

  const handleNext = () => {
    if (step === 'genres') {
      setStep('films');
    }
  };

  const handleBack = () => {
    if (step === 'films') {
      setStep('genres');
    }
  };

  const handleComplete = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    setIsSaving(true);
    try {
      // Save genre preferences
      await updatePreferences.mutateAsync({
        preferredGenres: selectedGenres,
        completedOnboarding: true,
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setIsSaving(false);
    }
  };

  const canProceedFromGenres = selectedGenres.length >= 3;
  const canComplete = selectedFilms.length >= 5 || selectedGenres.length >= 3;

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-4 max-w-6xl py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`h-2 w-24 rounded-full ${
                step === 'genres' ? 'bg-red-600' : 'bg-red-600'
              }`}
            />
            <div
              className={`h-2 w-24 rounded-full ${
                step === 'films' ? 'bg-red-600' : step === 'complete' ? 'bg-red-600' : 'bg-gray-700'
              }`}
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            Step {step === 'genres' ? '1' : '2'} of 2
          </div>
        </div>

        {/* Step 1: Select Genres */}
        {step === 'genres' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">What genres do you love?</h1>
              <p className="text-gray-300 text-lg mb-2">
                Select at least 3 genres to help us understand your taste
              </p>
              <p className="text-gray-400 text-sm">
                Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}
          </p>
        </div>

            {genresLoading ? (
              <div className="text-center py-12">Loading genres...</div>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <Badge
                      key={genre.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer px-6 py-3 text-base transition-all ${
                        isSelected
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                          : 'bg-gray-900 hover:bg-gray-800 text-white border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-4 pt-8">
              <Button
                onClick={handleNext}
                disabled={!canProceedFromGenres}
                size="lg"
                className="min-w-[200px] bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                Next: Select Films
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Films */}
        {step === 'films' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Which films do you like?</h1>
              <p className="text-gray-300 text-lg mb-2">
                Like at least 5 films to get better recommendations
              </p>
              <p className="text-gray-400 text-sm">
                Selected: {selectedFilms.length} film{selectedFilms.length !== 1 ? 's' : ''}
              </p>
        </div>

            {filmsLoading ? (
              <div className="text-center py-12">Loading films...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {films.map((film) => {
                  const filmId = film.tmdbId?.toString() || film.id;
                  const isSelected = selectedFilms.includes(filmId);
                  return (
                    <Card
                      key={film.id}
                      className={`p-0 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gray-900 border-gray-800 overflow-hidden group ${
                        isSelected ? 'ring-2 ring-red-600' : ''
                      }`}
                      onClick={() => toggleFilm(film)}
                    >
                      <div className="space-y-0">
                        <div className="aspect-[2/3] bg-gray-800 overflow-hidden relative">
                          <img
                            src={film.imageUrl || 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg'}
                            alt={film.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-red-600 text-white">✓ Selected</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-white truncate mb-1">
                          {film.title}
                        </h3>
                        <div className="flex gap-2 text-xs text-gray-400">
                          {film.year && <span>{film.year}</span>}
                          {film.genre && <span>• {film.genre}</span>}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-4 pt-8">
              <Button
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="min-w-[150px] border-gray-700 hover:bg-gray-800"
              >
                Back
              </Button>
          <Button
            onClick={handleComplete}
                disabled={!canComplete || isSaving}
            size="lg"
                className="min-w-[200px] bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
                {isSaving ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
