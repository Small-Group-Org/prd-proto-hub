"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type Generation = {
  id: number;
  prdName: string;
  prdContent: string;
  userEmail: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  estimatedCompletionTime: string;
  deployUrl: string | null;
  createdAt: string;
  completedAt: string | null;
};

function HistoryContent() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGenerations();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchGenerations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGenerations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/generations", {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGenerations(data);
        setError(null);
      } else {
        setError("Failed to load generations");
      }
    } catch (err) {
      setError("An error occurred while loading generations");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-50 text-green-700 border border-green-200`;
      case "IN_PROGRESS":
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      case "PENDING":
        return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "✓";
      case "IN_PROGRESS":
        return "⟳";
      case "PENDING":
        return "⏱";
      default:
        return "•";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (estimatedTime: string) => {
    const now = new Date();
    const estimated = new Date(estimatedTime);
    const diff = estimated.getTime() - now.getTime();
    
    if (diff <= 0) return "Overdue";
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="hero-gradient py-12 sm:py-16 md:py-20 px-4 text-center">
        <div className="container mx-auto max-w-7xl">
          <div className="fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 text-white tracking-tight">
              Generation History
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 px-2">
              Track all your PRD prototype generations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 max-w-7xl">
        {isLoading ? (
          <div className="light-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 relative z-10 fade-in">
            <div className="spinner mx-auto mb-4 text-primary"></div>
            <p className="text-muted text-base sm:text-lg">Loading generations...</p>
          </div>
        ) : error ? (
          <div className="light-card rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-red-50 border border-red-200 text-red-800 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 relative z-10 fade-in">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl">✗</span>
              <span className="font-semibold text-sm sm:text-base">{error}</span>
            </div>
          </div>
        ) : generations.length === 0 ? (
          <div className="light-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 relative z-10 fade-in">
            <div className="text-4xl sm:text-6xl mb-4">📋</div>
            <p className="text-foreground text-base sm:text-lg font-medium mb-2">No generations yet</p>
            <p className="text-muted text-sm sm:text-base mb-6">Start by submitting your first PRD</p>
            <Link
              href="/"
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 primary-button text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
            >
              Submit PRD →
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block light-card rounded-xl sm:rounded-2xl overflow-hidden -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 relative z-10 fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        PRD Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Completion
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Deploy Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {generations.map((gen) => (
                      <tr key={gen.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="text-sm font-semibold text-foreground mb-1">
                            {gen.prdName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>📧</span>
                            {gen.userEmail}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5 text-sm text-foreground">
                          <div className="font-medium">{formatDate(gen.createdAt)}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <span className={getStatusBadge(gen.status)}>
                            <span>{getStatusIcon(gen.status)}</span>
                            {gen.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5 text-sm">
                          {gen.status === "COMPLETED" && gen.completedAt ? (
                            <div>
                              <div className="font-medium text-foreground">✓ Completed</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(gen.completedAt)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-foreground">
                                {formatDate(gen.estimatedCompletionTime)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                ⏱ {getTimeRemaining(gen.estimatedCompletionTime)} remaining
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          {gen.deployUrl ? (
                            <a
                              href={gen.deployUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 primary-button text-white rounded-lg font-semibold text-xs lg:text-sm"
                            >
                              <span>🚀</span>
                              View Deploy
                            </a>
                          ) : (
                            <span className="text-muted text-xs lg:text-sm">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 -mt-8 sm:-mt-10 relative z-10 fade-in">
              {generations.map((gen) => (
                <div key={gen.id} className="light-card rounded-xl p-4 sm:p-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {gen.prdName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📧</span>
                        {gen.userEmail}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <span className={getStatusBadge(gen.status)}>
                          <span>{getStatusIcon(gen.status)}</span>
                          {gen.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Submitted</div>
                        <div className="text-xs font-medium text-foreground">
                          {new Date(gen.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-1">Completion</div>
                      {gen.status === "COMPLETED" && gen.completedAt ? (
                        <div>
                          <div className="text-xs font-medium text-foreground mb-1">✓ Completed</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(gen.completedAt)}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs font-medium text-foreground mb-1">
                            {formatDate(gen.estimatedCompletionTime)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ⏱ {getTimeRemaining(gen.estimatedCompletionTime)} remaining
                          </div>
                        </div>
                      )}
                    </div>

                    {gen.deployUrl && (
                      <div className="pt-2">
                        <a
                          href={gen.deployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 primary-button text-white rounded-lg font-semibold text-sm"
                        >
                          <span>🚀</span>
                          View Deploy
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

