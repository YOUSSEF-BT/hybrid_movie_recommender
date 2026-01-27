/**
 * Signup Form Component
 * 
 * Handles user registration with email, password, and optional name.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/ui/field';

export function SignupForm() {
  const { signup, isSigningUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signup({ email, password, name: name || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-muted-foreground">Join Amaynu to discover your next favorite.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <Field>
        <Label htmlFor="name">Name (Optional)</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </Field>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </Field>

      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          minLength={6}
        />
        <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
      </Field>

      <Button type="submit" className="w-full" disabled={isSigningUp}>
        {isSigningUp ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
