/**
 * User Profile Page
 * 
 * Displays user information and liked films.
 * Netflix-style dark theme layout.
 * Ready for FastAPI recommendation system integration.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { FilmCard } from '@/features/films/components/film-card';
import { useUserRecommendations } from '@/hooks/use-recommendations';
import type { Film } from '@/types';

export default function UserPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser();
  const router = useRouter();
  const likedFilms = userData?.likedFilms?.map((like: UserFilmLike) => like.film) || [];
  const { data: recs, isLoading: recsLoading, error: recsError } = useUserRecommendations(
    user?.id,
    'hybrid',
    12,
    !!user && likedFilms.length > 0
  );

  // Exclude already-liked films from recommendations (defensive UI filter)
  // We filter by both DB id and tmdbId because likes can be stored under either id form.
  const likedFilmIdSet = new Set(likedFilms.map((f: { id: string }) => f.id));
  const likedTmdbIdSet = new Set(
    likedFilms
      .map((f: { tmdbId?: number | null }) => f.tmdbId)
      .filter((v: number | null | undefined): v is number => typeof v === 'number')
  );
  const recommendedItems = (recs?.items || []).filter((item) => {
    if (likedFilmIdSet.has(item.film.id)) return false;
    const tmdbId = (item.film as any)?.tmdbId;
    if (typeof tmdbId === 'number' && likedTmdbIdSet.has(tmdbId)) return false;
    return true;
  });

  // Check if error is due to no likes (404) or network issues
  const isNoLikesError =
    (recsError as any)?.status === 404 ||
    recsError?.message?.includes('404') ||
    recsError?.message?.includes('no likes') ||
    recsError?.message?.includes('User has no likes');

  const isNetworkError = (recsError as any)?.type === 'network' || recsError?.message?.includes('Network error');
  const isConfigError = (recsError as any)?.type === 'config' || recsError?.message?.includes('NEXT_PUBLIC_RECS_API_URL');
  const memberSince = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '—';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  type UserFilmLike = {
    film: Film & { createdAt: Date }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Profile Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Your Profile</h1>
          <div className="space-y-4 bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wide">Name</span>
              <p className="text-xl text-white mt-1">{userData?.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wide">Email</span>
              <p className="text-xl text-white mt-1">{userData?.email}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm uppercase tracking-wide">Member Since</span>
              <p className="text-lg text-gray-300 mt-1">
                {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Liked Films */}
        <section>
          <h2 className="text-3xl font-bold mb-6">
            Liked Films <span className="text-gray-400 text-xl">({likedFilms.length})</span>
          </h2>
          {likedFilms.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {likedFilms.map((film: Film) => (
                <FilmCard key={film.id} film={film} isLiked={true} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">You haven&apos;t liked any films yet.</p>
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold">Recommended for You</h2>
            <span className="text-sm uppercase tracking-wide text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              Hybrid (content + collab)
            </span>
          </div>
          {recsLoading && (
            <div className="text-gray-400">Loading recommendations...</div>
          )}
          {recsError && !isNoLikesError && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <p className="text-red-400 font-semibold mb-2">Could not load recommendations</p>
              <p className="text-red-300 text-sm mb-4">
                {recsError.message || 'Unknown error occurred. Please check if the backend is running.'}
              </p>
              {isNetworkError && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded p-4 mt-4">
                  <p className="text-yellow-300 text-sm font-semibold mb-2">Troubleshooting:</p>
                  <ul className="text-yellow-200 text-xs list-disc list-inside space-y-1">
                    <li>Make sure the backend is running: <code className="bg-black/30 px-1 rounded">uvicorn app.main:app --reload --port 8000</code></li>
                    <li>Check that NEXT_PUBLIC_RECS_API_URL is set to <code className="bg-black/30 px-1 rounded">http://localhost:8000</code></li>
                    <li>Verify the backend is accessible at {(recsError as any)?.baseUrl || 'http://localhost:8000'}</li>
                  </ul>
                </div>
              )}
              {isConfigError && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded p-4 mt-4">
                  <p className="text-yellow-300 text-sm font-semibold mb-2">Configuration Issue:</p>
                  <p className="text-yellow-200 text-xs">
                    Add <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_RECS_API_URL=http://localhost:8000</code> to your <code className="bg-black/30 px-1 rounded">.env.local</code> file
                  </p>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-red-400 text-xs cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 text-xs text-red-200 overflow-auto">
                    {JSON.stringify({
                      message: recsError.message,
                      type: (recsError as any)?.type,
                      status: (recsError as any)?.status,
                      url: (recsError as any)?.url,
                      baseUrl: (recsError as any)?.baseUrl,
                    }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          {(isNoLikesError || (!recsLoading && !recsError && recs?.items?.length === 0)) && (
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">
                {likedFilms.length === 0 || isNoLikesError
                  ? "Like some films to get personalized recommendations!"
                  : "No recommendations available yet. Try liking more films."}
              </p>
            </div>
          )}
          {!recsLoading && recommendedItems.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendedItems.map((item) => (
                <FilmCard key={item.film.id} film={item.film} isLiked={false} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
