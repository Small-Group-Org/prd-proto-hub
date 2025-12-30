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
    <div className="min-h-screen flex items-center justify-center bg-[#001f3f]/85 px-4 py-8 sm:py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            PRD-PROTO-HUB
          </h1>
          <p className="text-sm sm:text-base text-gray-300 px-2">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <div className="light-card rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 text-center">
            Welcome back
          </h2>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">✗</span>
                <span className="font-medium text-sm sm:text-base break-words">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <button
              type="button"
              onClick={handleSsoLogin}
              disabled={isLoading}
              className="w-full primary-button py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base focus:outline-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span className="hidden sm:inline">Redirecting to SSO...</span>
                  <span className="sm:hidden">Redirecting...</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg">🔐</span>
                  <span className="hidden sm:inline">Login with Small Group</span>
                  <span className="sm:hidden">Login</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            <p>
              🔐 Secure authentication powered by Small Group
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-300 px-2">
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
      <div className="min-h-screen flex items-center justify-center bg-[#001f3f]/85 px-4">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-sm sm:text-base text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

