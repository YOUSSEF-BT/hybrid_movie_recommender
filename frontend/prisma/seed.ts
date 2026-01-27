/**
 * Database Seed Script
 * 
 * Populates the database with mock music and film data.
 * Run with: npx tsx prisma/seed.ts
 */

// Load environment variables first
import 'dotenv/config';

// Import the Prisma client from lib/prisma.ts to reuse the same adapter configuration
import { prisma } from '../lib/prisma';

// Placeholder image URLs from Supabase storage
const MUSIC_PLACEHOLDER = 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/music_place_holder.webp';
const FILM_PLACEHOLDER = 'https://ipexktsgctofdbmmgkxo.supabase.co/storage/v1/object/public/images/film_place_holder.jpg';

const mockMusic = [
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Levitating',
    artist: 'Dua Lipa',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    genre: 'Pop Rock',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Heat Waves',
    artist: 'Glass Animals',
    genre: 'Indie Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'As It Was',
    artist: 'Harry Styles',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Shivers',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Flowers',
    artist: 'Miley Cyrus',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Unholy',
    artist: 'Sam Smith & Kim Petras',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'About Damn Time',
    artist: 'Lizzo',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'First Class',
    artist: 'Jack Harlow',
    genre: 'Hip Hop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
  {
    title: 'Running Up That Hill',
    artist: 'Kate Bush',
    genre: 'Pop',
    imageUrl: MUSIC_PLACEHOLDER,
  },
];

const mockFilms = [
  {
    title: 'Inception',
    director: 'Christopher Nolan',
    genre: 'Sci-Fi',
    year: 2010,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    genre: 'Action',
    year: 2008,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Interstellar',
    director: 'Christopher Nolan',
    genre: 'Sci-Fi',
    year: 2014,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Parasite',
    director: 'Bong Joon-ho',
    genre: 'Thriller',
    year: 2019,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Matrix',
    director: 'The Wachowskis',
    genre: 'Sci-Fi',
    year: 1999,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    genre: 'Crime',
    year: 1994,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Shawshank Redemption',
    director: 'Frank Darabont',
    genre: 'Drama',
    year: 1994,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    genre: 'Crime',
    year: 1972,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Fight Club',
    director: 'David Fincher',
    genre: 'Drama',
    year: 1999,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis',
    genre: 'Drama',
    year: 1994,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Lord of the Rings: The Fellowship',
    director: 'Peter Jackson',
    genre: 'Fantasy',
    year: 2001,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Avengers',
    director: 'Joss Whedon',
    genre: 'Action',
    year: 2012,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Titanic',
    director: 'James Cameron',
    genre: 'Romance',
    year: 1997,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'Avatar',
    director: 'James Cameron',
    genre: 'Sci-Fi',
    year: 2009,
    imageUrl: FILM_PLACEHOLDER,
  },
  {
    title: 'The Lion King',
    director: 'Roger Allers & Rob Minkoff',
    genre: 'Animation',
    year: 1994,
    imageUrl: FILM_PLACEHOLDER,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing films...');
  await prisma.userFilmLike.deleteMany();
  await prisma.film.deleteMany();

  // Note: Music seeding removed as Music model is not in the current schema

  // Seed films
  console.log('Adding films...');
  for (const film of mockFilms) {
    await prisma.film.create({
      data: film,
    });
  }
  console.log(`✅ Added ${mockFilms.length} films`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
