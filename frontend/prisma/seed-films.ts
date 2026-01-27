/**
 * Film Seeding Script
 * 
 * Seeds the database with IMDB Top 1000 films from CSV file.
 * Run with: npx tsx prisma/seed-films.ts
 */

// Load environment variables first
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import Papa from 'papaparse';
import { prisma } from '../lib/prisma';

const FILM_PLACEHOLDER = 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg';

interface CSVFilm {
  Poster_Link: string;
  Series_Title: string;
  Released_Year: string;
  Certificate: string;
  Runtime: string;
  Genre: string;
  IMDB_Rating: string;
  Overview: string;
  Meta_score: string;
  Director: string;
  Star1: string;
  Star2: string;
  Star3: string;
  Star4: string;
  No_of_Votes: string;
  Gross: string;
}

function parseYear(yearStr: string): number | null {
  // Handle cases where year might be "PG" or other non-numeric values
  const year = parseInt(yearStr, 10);
  return isNaN(year) ? null : year;
}

function parseGenre(genreStr: string): string | null {
  // Take the first genre if multiple genres are listed (e.g., "Crime, Drama" -> "Crime")
  if (!genreStr) return null;
  return genreStr.split(',')[0].trim() || null;
}

async function main() {
  console.log('🌱 Seeding films from IMDB Top 1000 CSV...');

  // Read CSV file
  const csvPath = join(process.cwd(), '..', 'data', 'imdb_top_1000.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const parseResult = Papa.parse<CSVFilm>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors);
  }

  const films = parseResult.data;
  console.log(`📊 Found ${films.length} films in CSV`);

  // Clear existing films (but keep user likes)
  console.log('Clearing existing films...');
  await prisma.userFilmLike.deleteMany();
  await prisma.film.deleteMany();

  // Seed films
  console.log('Adding films to database...');
  let successCount = 0;
  let errorCount = 0;

  for (const film of films) {
    try {
      // Skip if missing essential data
      if (!film.Series_Title || !film.Director) {
        console.warn(`Skipping film: Missing title or director - ${film.Series_Title || 'Unknown'}`);
        errorCount++;
        continue;
      }

      const year = parseYear(film.Released_Year);
      const genre = parseGenre(film.Genre);
      
      // Use poster link if available, otherwise use placeholder
      const imageUrl = film.Poster_Link && film.Poster_Link.trim() !== '' 
        ? film.Poster_Link.trim() 
        : FILM_PLACEHOLDER;

      await prisma.film.create({
        data: {
          title: film.Series_Title.trim(),
          director: film.Director.trim(),
          genre: genre,
          year: year,
          imageUrl: imageUrl,
        },
      });

      successCount++;
    } catch (error) {
      console.error(`Error adding film "${film.Series_Title}":`, error);
      errorCount++;
    }
  }

  console.log(`✅ Successfully added ${successCount} films`);
  if (errorCount > 0) {
    console.log(`⚠️  Skipped ${errorCount} films due to errors`);
  }
  console.log('🎉 Film seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
