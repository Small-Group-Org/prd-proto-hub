"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 py-4 md:py-5">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold text-foreground hover:text-primary transition-colors tracking-tight"
          >
            PRD-PROTO-HUB
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    pathname === '/' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'nav-button hover:bg-gray-100'
                  }`}
                >
                  Submit PRD
                </Link>
                <Link
                  href="/history"
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    pathname === '/history' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'nav-button hover:bg-gray-100'
                  }`}
                >
                  History
                </Link>
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-300">
                  <span className="text-sm text-gray-700 hidden lg:inline">
                    👤 {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-sm text-gray-700 lg:hidden">
                    👤 {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-lg primary-button font-medium text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    pathname === '/' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'nav-button hover:bg-gray-100'
                  }`}
                >
                  Submit PRD
                </Link>
                <Link
                  href="/history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    pathname === '/history' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'nav-button hover:bg-gray-100'
                  }`}
                >
                  History
                </Link>
                <div className="px-4 py-3 border-t border-gray-200 mt-2 pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-700">
                      👤 {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg primary-button font-medium text-sm text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

