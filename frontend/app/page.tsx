/**
 * Home Page
 * 
 * Netflix-style layout with personalized recommendations.
 * Shows recommendations based on user preferences and liked films.
 */

'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { useFilms } from '@/hooks/use-films';
import { useUserRecommendations } from '@/hooks/use-recommendations';
import { HeroCarousel } from '@/features/films/components/hero-carousel';
import { FilmCard } from '@/features/films/components/film-card';

function HomePageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const { user } = useAuth();
  const { data: userData } = useUser();

  // Get personalized recommendations if user is logged in and has preferences
  const hasPreferences = userData?.preferences?.completedOnboarding;
  const hasLikes = userData?.likedFilms && userData.likedFilms.length > 0;
  const shouldShowRecommendations = user && (hasPreferences || hasLikes);

  const { data: recommendations, isLoading: recsLoading } = useUserRecommendations(
    user?.id,
    'hybrid', // Use hybrid algorithm (content + collaborative)
    20,
    shouldShowRecommendations
  );

  // Fallback to all films if no recommendations or search/filter is active
  const { data: allFilms, isLoading: filmsLoading } = useFilms({
    search: search || undefined,
    genre: genre || undefined,
  });

  const isLoading = shouldShowRecommendations ? recsLoading : filmsLoading;
  const films = useMemo(() => {
    // If search or filter is active, use filtered films
    if (search || genre) {
      return allFilms || [];
    }
    // If user has recommendations, use those
    if (shouldShowRecommendations && recommendations?.items) {
      return recommendations.items.map((item) => item.film);
    }
    // Otherwise use all films
    return allFilms || [];
  }, [search, genre, allFilms, shouldShowRecommendations, recommendations]);

  const featuredMovies = useMemo(
    () =>
      (films || [])
        .slice(0, 10)
        .map((film) => ({
          id: film.id,
          title: film.title,
          year: film.year ?? undefined,
          rating: film.rating ?? undefined,
          genre: film.genre ?? undefined,
          imageUrl:
            film.imageUrl ||
            'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg',
          backdropUrl: film.backdropUrl ?? undefined,
          overview: film.overview ?? undefined,
          tmdbId: film.tmdbId,
        })),
    [films]
  );

  const sectionTitle = useMemo(() => {
    if (search || genre) {
      return 'Search Results';
    }
    if (shouldShowRecommendations) {
      return 'Recommended for You';
    }
    return 'All Films';
  }, [search, genre, shouldShowRecommendations]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Carousel */}
      {isLoading ? (
        <div className="h-screen flex items-center justify-center pt-16">
          <div className="text-center">Loading featured films...</div>
        </div>
      ) : featuredMovies.length > 0 ? (
        <div className="pt-16">
          <HeroCarousel movies={featuredMovies} />
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center text-gray-400 pt-16">
          No featured films available
        </div>
      )}

      {/* Films Grid */}
      <section className="container mx-auto px-4 md:px-8 pb-12 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{sectionTitle}</h2>
          {shouldShowRecommendations && !search && !genre && (
            <p className="text-sm text-gray-400">
              Based on your preferences and similar users
            </p>
          )}
        </div>
        {isLoading ? (
          <div className="text-center py-12">Loading films...</div>
        ) : films && films.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {shouldShowRecommendations && !search && !genre
              ? "Like some films to get personalized recommendations!"
              : "No films found."}
          </div>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white">
        <div className="h-screen flex items-center justify-center pt-16">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
