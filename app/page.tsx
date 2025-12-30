"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [prdName, setPrdName] = useState("");
  const [prdContent, setPrdContent] = useState("");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Mock file parsing - read as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && !prdContent) {
          setPrdContent(text);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          prdName: prdName || (file ? file.name : "Untitled PRD"),
          prdContent,
          userEmail: userEmail || user?.email,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Generation started. You'll receive the deploy link by email.",
        });
        // Reset form
        setPrdName("");
        setPrdContent("");
        setUserEmail("");
        setFile(null);
        // Clear file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        // Redirect to history after 2 seconds
        setTimeout(() => {
          router.push("/history");
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to start generation.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="hero-gradient py-12 sm:py-16 md:py-20 lg:py-24 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          <div className="fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 text-white tracking-tight">
              PRD to UI Prototype
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 px-2">
              Submit your PRD and generate UI prototypes
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 max-w-4xl">
        <div className="light-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 relative z-10 fade-in">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{message.type === "success" ? "✓" : "✗"}</span>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="fade-in-delay-1">
              <label htmlFor="prd-name" className="block text-xs sm:text-sm font-semibold text-foreground mb-2 tracking-wide">
                PRD Name <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </label>
              <input
                id="prd-name"
                type="text"
                value={prdName}
                onChange={(e) => setPrdName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 light-input rounded-lg text-sm sm:text-base"
                placeholder="Enter a descriptive name for your PRD"
              />
            </div>

            <div className="fade-in-delay-2">
              <label htmlFor="prd-content" className="block text-xs sm:text-sm font-semibold text-foreground mb-2 tracking-wide">
                PRD Content
              </label>
              <textarea
                id="prd-content"
                value={prdContent}
                onChange={(e) => setPrdContent(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 light-textarea rounded-lg font-mono text-xs sm:text-sm resize-y min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"
                rows={10}
                placeholder="Paste your PRD content here...&#10;&#10;Include details about:&#10;- Features and requirements&#10;- User flows&#10;- Design specifications&#10;- Technical constraints"
                required
              />
            </div>

            <div className="fade-in-delay-3">
              <div className="divider-text">
                <span className="text-xs sm:text-sm">Or Upload File</span>
              </div>
              <div className="file-upload-area rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-10 text-center">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 light-input rounded-lg text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer cursor-pointer"
                />
                {file && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-blue-900 break-words">
                      ✓ Selected: <span className="text-primary font-semibold">{file.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="fade-in-delay-4">
              <label htmlFor="user-email" className="block text-xs sm:text-sm font-semibold text-foreground mb-2 tracking-wide">
                Your Email
              </label>
              <input
                id="user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 light-input rounded-lg text-sm sm:text-base"
                placeholder="your.email@example.com"
                required
              />
              <p className="mt-2 text-xs text-muted flex items-start sm:items-center gap-1.5">
                <span className="mt-0.5 sm:mt-0">📧</span>
                <span>Deploy link will be sent to this email address when generation completes</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !prdContent || !userEmail}
              className="w-full primary-button py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base focus:outline-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span className="hidden sm:inline">Starting Generation...</span>
                  <span className="sm:hidden">Starting...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span className="hidden sm:inline">Generate UI Prototype</span>
                  <span className="sm:hidden">Generate</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

