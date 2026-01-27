/**
 * Fetch movies from TMDB, map to IMDb IDs, and seed into the films table.
 *
 * - Uses TMDB popular & top-rated endpoints to collect many films.
 * - For each film, fetches details to extract imdb_id and genre names.
 * - Upserts into the Prisma `films` table with minimal metadata.
 *
 * Requirements:
 * - Environment: TMDB_API_KEY
 * - Run from `frontend/` with `npx tsx prisma/fetch-and-seed-imdb.ts`
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// How many pages to fetch from each list (popular + top_rated). Each page is ~20 movies.
const MAX_PAGES = parseInt(process.env.TMDB_MAX_PAGES || '10', 10); // 10 pages ≈ 200 movies per list

if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY is required. Set it in your environment (.env.local).');
  process.exit(1);
}

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  overview: string;
};

type TmdbListResponse = {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
};

type TmdbDetails = {
  id: number;
  imdb_id: string | null;
  title: string;
  overview: string | null;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  videos?: {
    results: Array<{
      key: string;
      type: string;
      site: string;
    }>;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function posterUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

async function fetchList(type: 'popular' | 'top_rated', page: number): Promise<TmdbListResponse> {
  return fetchJson<TmdbListResponse>(`${TMDB_BASE_URL}/movie/${type}?api_key=${TMDB_API_KEY}&page=${page}`);
}

async function fetchDetails(tmdbId: number): Promise<TmdbDetails> {
  // append videos to capture trailer keys
  return fetchJson<TmdbDetails>(
    `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos`
  );
}

async function* iterTmdbMovies() {
  for (const type of ['popular', 'top_rated'] as const) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const list = await fetchList(type, page);
      for (const movie of list.results) {
        yield movie;
      }
      // light rate limiting
      await sleep(150);
    }
  }
}

async function main() {
  console.log(`➡️  Fetching up to ${MAX_PAGES} pages each from TMDB popular + top_rated...`);

  let processed = 0;
  for await (const movie of iterTmdbMovies()) {
    try {
      const details = await fetchDetails(movie.id);
      const imdbId = details.imdb_id;
      // If imdb_id missing, fall back to tmdb id as string
      const filmId = imdbId || movie.id.toString();

      const genreNames = details.genres?.map((g) => g.name).filter(Boolean) ?? [];
      const year = details.release_date ? parseInt(details.release_date.split('-')[0]) : null;
      const trailer = details.videos?.results?.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );
      const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

      // Upsert film with rich metadata
      const film = await prisma.film.upsert({
        where: { id: filmId },
        create: {
          id: filmId,
          title: details.title || movie.title,
          director: null,
          genre: genreNames[0] ?? null,
          genres: genreNames.length ? genreNames.join(', ') : null,
          imageUrl: posterUrl(details.poster_path),
          backdropUrl: posterUrl(details.backdrop_path, 'w780'),
          overview: details.overview || movie.overview,
          rating: movie.vote_average ?? null,
          trailerUrl,
          year: isNaN(year || 0) ? null : year,
          tmdbId: details.id,
        },
        update: {
          title: details.title || movie.title,
          genre: genreNames[0] ?? null,
          genres: genreNames.length ? genreNames.join(', ') : null,
          imageUrl: posterUrl(details.poster_path),
          backdropUrl: posterUrl(details.backdrop_path, 'w780'),
          overview: details.overview || movie.overview,
          rating: movie.vote_average ?? null,
          trailerUrl,
          year: isNaN(year || 0) ? null : year,
          tmdbId: details.id,
        },
      });

      // Upsert genres and join table
      for (const name of genreNames) {
        const genre = await prisma.genre.upsert({
          where: { name },
          create: { name },
          update: {},
        });
        await prisma.filmGenre.upsert({
          where: { filmId_genreId: { filmId: film.id, genreId: genre.id } },
          create: { filmId: film.id, genreId: genre.id },
          update: {},
        });
      }
      processed += 1;
      if (processed % 50 === 0) {
        console.log(`✅ Upserted ${processed} films...`);
      }
      // light rate limit between detail calls
      await sleep(120);
    } catch (err) {
      console.error(`Failed to process TMDB id ${movie.id}:`, err);
      await sleep(300); // brief backoff
    }
  }

  console.log(`🎉 Done. Upserted ~${processed} films into the database.`);
}

main()
  .catch((e) => {
    console.error('❌ Fetch/seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
