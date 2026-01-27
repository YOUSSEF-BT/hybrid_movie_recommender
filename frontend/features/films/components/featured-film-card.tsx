/**
 * Featured Film Card Component
 * 
 * Large poster card for the hero section with hover effects.
 * Netflix-style design with zoom and overlay.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/hooks/use-movies';

interface FeaturedFilmCardProps {
  movie: Movie;
}

export function FeaturedFilmCard({ movie }: FeaturedFilmCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/movies/${movie.tmdbId}`}>
      <div
        className="relative group cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ${
            isHovered ? 'scale-105 z-10' : 'scale-100'
          }`}
        >
          {/* Poster Image */}
          <div className="aspect-[2/3] bg-gray-900">
            <img
              src={movie.imageUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          {/* Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                {movie.title}
              </h3>
              {movie.year && (
                <p className="text-white/80 text-sm">{movie.year}</p>
              )}
              {movie.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 text-sm">⭐ {movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
