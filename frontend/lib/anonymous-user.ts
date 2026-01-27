/**
 * Anonymous User Data Management
 * 
 * Stores user film likes in localStorage even when not logged in.
 * When user logs in, this data is synced to the database.
 * Ready for FastAPI recommendation system integration.
 */

const ANONYMOUS_LIKES_KEY = 'amaynu_anonymous_likes';
const ANONYMOUS_PREFERENCES_KEY = 'amaynu_anonymous_preferences';

export type AnonymousLikes = {
  films: string[];
};

export type AnonymousPreferences = {
  // Reserved for future recommendation system preferences
} & Record<string, never>;

export function getAnonymousLikes(): AnonymousLikes {
  if (typeof window === 'undefined') {
    return { films: [] };
  }

  try {
    const stored = localStorage.getItem(ANONYMOUS_LIKES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get anonymous likes:', error);
  }

  return { films: [] };
}

export function saveAnonymousLike(type: 'films', id: string, liked: boolean) {
  if (typeof window === 'undefined') return;

  try {
    const current = getAnonymousLikes();
    const list = current[type];
    
    if (liked) {
      if (!list.includes(id)) {
        list.push(id);
      }
    } else {
      const index = list.indexOf(id);
      if (index > -1) {
        list.splice(index, 1);
      }
    }

    localStorage.setItem(ANONYMOUS_LIKES_KEY, JSON.stringify({
      ...current,
      [type]: list,
    }));
  } catch (error) {
    console.error('Failed to save anonymous like:', error);
  }
}

export function getAnonymousPreferences(): AnonymousPreferences {
  if (typeof window === 'undefined') {
    return {} as AnonymousPreferences;
  }

  try {
    const stored = localStorage.getItem(ANONYMOUS_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored) as AnonymousPreferences;
    }
  } catch (error) {
    console.error('Failed to get anonymous preferences:', error);
  }

  return {} as AnonymousPreferences;
}

export function saveAnonymousPreferences(preferences: AnonymousPreferences) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ANONYMOUS_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save anonymous preferences:', error);
  }
}

export function clearAnonymousData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ANONYMOUS_LIKES_KEY);
  localStorage.removeItem(ANONYMOUS_PREFERENCES_KEY);
}
