"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginPageContent() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for token from SAML callback
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    console.log('[Login] Token from URL:', token ? 'Present' : 'Missing');
    console.log('[Login] Error from URL:', errorParam);

    if (token) {
      console.log('[Login] Storing token in localStorage');
      localStorage.setItem('token', token);
      
      console.log('[Login] Calling refreshUser...');
      refreshUser()
        .then(() => {
          console.log('[Login] User refreshed successfully, redirecting to /');
          router.push('/');
        })
        .catch((error) => {
          console.error('[Login] Failed to refresh user:', error);
          setError('Failed to verify SSO session: ' + (error.message || 'Unknown error'));
        });
    }

    if (errorParam) {
      console.error('[Login] SSO Error:', errorParam);
      setError('SSO Login Failed: ' + errorParam);
    }
  }, [searchParams, refreshUser, router]);

  const handleSsoLogin = () => {
    setIsLoading(true);
    setError('');
    // Redirect to SAML login endpoint
    window.location.href = '/api/auth/saml/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            PRD-to-Proto
          </h1>
          <p className="text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="light-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Welcome back
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">✗</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleSsoLogin}
              disabled={isLoading}
              className="w-full primary-button py-3 px-6 rounded-xl font-bold text-base focus:outline-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Redirecting to SSO...
                </>
              ) : (
                <>
                  <span className="text-lg">🔐</span>
                  Login with Small Group
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              🔐 Secure authentication powered by Small Group
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account? Contact your administrator for an invitation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

