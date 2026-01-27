/**
 * Hero Carousel Component
 * 
 * Full-screen carousel for featured movies, Netflix-style.
 * Auto-plays and slides one by one with navigation controls.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HeroMovie = {
  id: string;
  title: string;
  year?: number | null;
  rating?: number;
  genre?: string | null;
  imageUrl: string;
  backdropUrl?: string | null;
  overview?: string | null;
  tmdbId?: number;
};

interface HeroCarouselProps {
  movies: HeroMovie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (movies.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [movies.length, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Fade Transition */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          }`}
          style={{
            backgroundImage: movie.backdropUrl
              ? `url(${movie.backdropUrl})`
              : `url(${movie.imageUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-2xl animate-in fade-in duration-500">
              {currentMovie.title}
            </h1>

            <div className="flex items-center gap-4 mb-4 text-white flex-wrap">
              {currentMovie.year && (
                <span className="text-lg md:text-xl">{currentMovie.year}</span>
              )}
              {currentMovie.rating && (
                <span className="flex items-center gap-1 text-lg md:text-xl">
                  ⭐ {currentMovie.rating.toFixed(1)}
                </span>
              )}
              {currentMovie.genre && (
                <span className="text-lg md:text-xl">• {currentMovie.genre}</span>
              )}
            </div>

            {currentMovie.overview && (
              <p className="text-white/90 text-sm md:text-lg mb-6 line-clamp-3 drop-shadow-lg max-w-xl">
                {currentMovie.overview}
              </p>
            )}

            <div className="flex gap-4 flex-wrap">
              <Link href={`/movies/${currentMovie.tmdbId || currentMovie.id}`}>
                <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 text-base md:text-lg px-6 md:px-8">
                  ▶ Play
                </Button>
              </Link>
              <Link href={`/movies/${currentMovie.tmdbId || currentMovie.id}`}>
                <Button size="lg" variant="outline" className="bg-black/70 text-white border-white/80 hover:bg-white/20 hover:border-white hover:text-white text-base md:text-lg px-6 md:px-8">
                  ℹ️ More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Previous movie"
      >
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Next movie"
      >
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
