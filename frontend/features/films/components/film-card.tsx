/**
 * Film Card Component
 * 
 * Displays a film card with like functionality.
 * Netflix-style design with hover effects.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Film } from '@/types';
import { useLikeFilm } from '@/hooks/use-films';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { getAnonymousLikes } from '@/lib/anonymous-user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FilmCardProps {
  film: Film & { tmdbId?: number };
  isLiked?: boolean;
}

export function FilmCard({ film, isLiked: initialLiked = false }: FilmCardProps) {
  const { user } = useAuth();
  const { data: userData } = useUser();
  const likeMutation = useLikeFilm();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLiking, setIsLiking] = useState(false);

  // Use tmdbId for navigation if available, otherwise use id
  const movieId = film.tmdbId || film.id;

  // Check if film is liked by user
  useEffect(() => {
    if (user && userData?.likedFilms) {
      const likedFilmIds = userData.likedFilms.map((like: { film: { id: string } }) => like.film.id);
      setIsLiked(likedFilmIds.includes(film.id));
    } else if (!user) {
      const anonymousLikes = getAnonymousLikes();
      setIsLiked(anonymousLikes.films.includes(film.id));
    }
  }, [user, userData, film.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiking(true);
    try {
      const filmForLike = {
        id: film.tmdbId?.toString() || film.id,
        title: film.title,
        director: film.director ?? null,
        genre: film.genre ?? null,
        imageUrl: film.imageUrl ?? null,
        year: film.year ?? null,
        tmdbId: film.tmdbId,
      };

      const result = await likeMutation.mutateAsync(filmForLike);
      setIsLiked(result.liked);
    } catch (error) {
      console.error('Failed to like film:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="p-0 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gray-900 border-gray-800 overflow-hidden group">
      <Link href={`/movies/${movieId}`}>
        <div className="space-y-0">
          <div className="aspect-[2/3] bg-gray-800 overflow-hidden relative">
            <img
              src={film.imageUrl || 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg'}
              alt={film.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Link>
      
      <div className="p-3">
        <Link href={`/movies/${movieId}`}>
          <h3 className="font-semibold text-sm text-white truncate mb-1 hover:text-gray-300 transition-colors">
            {film.title}
          </h3>
        </Link>
        <div className="flex gap-2 text-xs text-gray-400 mb-2">
          {film.year && <span>{film.year}</span>}
          {film.genre && <span>• {film.genre}</span>}
        </div>
        
        {user && (
          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`w-full text-xs ${
              isLiked 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-transparent border-white/80 text-white hover:bg-white/20 hover:border-white'
            }`}
          >
            {isLiked ? '❤️ Liked' : '🤍 Like'}
          </Button>
        )}
      </div>
    </Card>
  );
}
