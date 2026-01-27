/**
 * Movie Detail Page
 * 
 * Displays full movie details including trailer, overview, and all information.
 * Netflix-style layout with dark theme.
 */

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMovieDetails } from '@/hooks/use-movies';
import { useLikeFilm } from '@/hooks/use-films';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { useSimilarFilms } from '@/hooks/use-recommendations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilmCard } from '@/features/films/components/film-card';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;
  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const { user } = useAuth();
  const { data: userData } = useUser();
  const likeMutation = useLikeFilm();
  const [isLiked, setIsLiked] = useState(false);
  const externalId = movie?.tmdbId?.toString() || movie?.id;
  const { data: similar, isLoading: similarLoading } = useSimilarFilms(
    externalId,
    'hybrid',
    12,
    !!externalId
  );

  // Check if movie is liked
  useEffect(() => {
    if (user && userData?.likedFilms && movie) {
      // The film ID used in DB is tmdbId.toString() or the id itself
      const movieDbId = movie.tmdbId?.toString() || movie.id;
      const likedFilmIds = userData.likedFilms.map((like: { film: { id: string } }) => like.film.id);
      setIsLiked(likedFilmIds.includes(movieDbId));
    }
  }, [user, userData, movie]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-xl">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!user) return;
    try {
      const filmForLike = {
        id: movie.tmdbId?.toString() || movie.id,
        title: movie.title,
        director: movie.director ?? null,
        genre: movie.genres?.[0] ?? movie.genre ?? null,
        imageUrl: movie.imageUrl ?? null,
        year: movie.year ?? null,
        tmdbId: movie.tmdbId,
      };

      const result = await likeMutation.mutateAsync(filmForLike);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Failed to like movie:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full">
        {movie.backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        )}
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-12 z-10">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-2xl">
                {movie.title}
              </h1>
              <div className="flex items-center gap-4 mb-6 text-white flex-wrap">
                {movie.year && <span className="text-lg md:text-xl">{movie.year}</span>}
                {movie.rating && (
                  <span className="flex items-center gap-1 text-lg md:text-xl">
                    ⭐ {movie.rating.toFixed(1)}
                  </span>
                )}
                {movie.runtime && (
                  <span className="text-lg md:text-xl">{movie.runtime} min</span>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <span className="text-lg md:text-xl">• {movie.genres[0]}</span>
                )}
              </div>
              <div className="flex gap-4 flex-wrap">
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 text-base md:text-lg px-6 md:px-8">
                      ▶ Watch Trailer
                    </Button>
                  </a>
                )}
                {user && (
                  <Button 
                    size="lg" 
                    onClick={handleLike}
                    variant={isLiked ? 'default' : 'outline'}
                    className={`text-base md:text-lg px-6 md:px-8 ${
                      isLiked
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-black/70 text-white border-white/80 hover:bg-white/20 hover:border-white hover:text-white'
                    }`}
                  >
                    {likeMutation.isPending ? 'Liking...' : isLiked ? '❤️ Liked' : '🤍 Like'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <img
              src={movie.imageUrl}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {movie.overview && (
              <div>
                <h2 className="text-3xl font-bold mb-4">Overview</h2>
                <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {movie.releaseDate && (
                <div>
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Release Date</h4>
                  <p className="text-lg">{new Date(movie.releaseDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              )}
              {movie.rating && (
                <div>
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Rating</h4>
                  <p className="text-lg">⭐ {movie.rating.toFixed(1)} / 10</p>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Runtime</h4>
                  <p className="text-lg">{movie.runtime} minutes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trailer Section */}
        {movie.trailerUrl && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Trailer</h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={movie.trailerUrl}
                title={`${movie.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Similar Films */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold">Similar Films</h2>
            <span className="text-sm uppercase tracking-wide text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              Hybrid (content + collab)
            </span>
          </div>
          {similarLoading && (
            <div className="text-gray-400">Loading similar films...</div>
          )}
          {!similarLoading && similar?.items?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {similar.items.map((item) => (
                <FilmCard key={item.film.id} film={item.film} />
              ))}
            </div>
          ) : (
            !similarLoading && <div className="text-gray-400">No similar films found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
