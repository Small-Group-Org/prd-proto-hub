"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on login/accept-invitation pages
  if (pathname === '/login' || pathname === '/accept-invitation') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-6 md:px-12 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors tracking-tight">
            PRD-to-Proto
          </Link>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-lg nav-button font-medium text-sm"
                >
                  Submit PRD
                </Link>
                <Link
                  href="/history"
                  className="px-5 py-2.5 rounded-lg nav-button font-medium text-sm"
                >
                  History
                </Link>
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-300">
                  <span className="text-sm text-gray-700">
                    👤 {user?.firstName} {user?.lastName}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
        </div>
      </div>
    </nav>
  );
}

