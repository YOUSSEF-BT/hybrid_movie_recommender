/**
 * Navigation Component
 * 
 * Main navigation bar with links to home, user profile, and logout.
 * Netflix-style dark theme.
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useGenres } from '@/hooks/use-genres';

function NavigationContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: genres } = useGenres();

  const currentSearch = searchParams.get('q') || '';
  const currentGenre = searchParams.get('genre') || '';

  const updateFilters = (nextSearch: string, nextGenre: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSearch) params.set('q', nextSearch);
    else params.delete('q');

    if (nextGenre) params.set('genre', nextGenre);
    else params.delete('genre');

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-white hover:text-red-600 transition-colors whitespace-nowrap">
          Amaynu
        </Link>

        {/* Search + Genre filters (home only) */}
        {pathname === '/' && (
          <div className="flex-1 flex items-center gap-3">
            <input
              defaultValue={currentSearch}
              onChange={(e) => updateFilters(e.target.value, currentGenre)}
              placeholder="Search by title or overview"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              defaultValue={currentGenre}
              onChange={(e) => updateFilters(currentSearch, e.target.value)}
              className="w-40 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres?.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 whitespace-nowrap">
          {user ? (
            <>
              <Link href="/user" className="text-sm text-white hover:text-gray-300 transition-colors">
                {user.name || user.email}
              </Link>
              <Button variant="outline" size="sm" onClick={logout} className="bg-transparent border-white/80 text-white hover:bg-white hover:text-black hover:border-white">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Navigation() {
  return (
    <Suspense fallback={
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold text-white hover:text-red-600 transition-colors whitespace-nowrap">
            Amaynu
          </Link>
        </div>
      </nav>
    }>
      <NavigationContent />
    </Suspense>
  );
}
