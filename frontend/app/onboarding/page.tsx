/**
 * Onboarding Page
 * 
 * First-time user experience for selecting favorite artists.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { Onboarding } from '@/features/user/components/onboarding';

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (
      !userLoading &&
      userData?.preferences?.completedOnboarding
    ) {
      router.push('/');
    }
  }, [user, userData, authLoading, userLoading, router]);

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Onboarding />;
}
