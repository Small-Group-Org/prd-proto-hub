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
      <div className="hero-gradient py-20 md:py-24 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          <div className="fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-white tracking-tight">
              PRD to UI Prototype
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Submit your PRD and generate UI prototypes
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <div className="light-card rounded-2xl p-8 md:p-12 -mt-12 md:-mt-16 relative z-10 fade-in">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="fade-in-delay-1">
              <label htmlFor="prd-name" className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
                PRD Name <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </label>
              <input
                id="prd-name"
                type="text"
                value={prdName}
                onChange={(e) => setPrdName(e.target.value)}
                className="w-full px-4 py-3 light-input rounded-lg"
                placeholder="Enter a descriptive name for your PRD"
              />
            </div>

            <div className="fade-in-delay-2">
              <label htmlFor="prd-content" className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
                PRD Content
              </label>
              <textarea
                id="prd-content"
                value={prdContent}
                onChange={(e) => setPrdContent(e.target.value)}
                className="w-full px-4 py-3.5 light-textarea rounded-lg font-mono text-sm resize-y min-h-[300px]"
                rows={14}
                placeholder="Paste your PRD content here...&#10;&#10;Include details about:&#10;- Features and requirements&#10;- User flows&#10;- Design specifications&#10;- Technical constraints"
                required
              />
            </div>

            <div className="fade-in-delay-3">
              <div className="divider-text">
                <span>Or Upload File</span>
              </div>
              <div className="file-upload-area rounded-xl p-10 text-center">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 light-input rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer cursor-pointer"
                />
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      ✓ Selected: <span className="text-primary font-semibold">{file.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="fade-in-delay-4">
              <label htmlFor="user-email" className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
                Your Email
              </label>
              <input
                id="user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 light-input rounded-lg bg-gray-50"
                placeholder="your.email@example.com"
                readOnly={!!user}
                required
              />
              <p className="mt-2 text-xs text-muted flex items-center gap-1.5">
                <span>📧</span> Deploy link will be sent to this email address when generation completes
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !prdContent || !userEmail}
              className="w-full primary-button py-4 px-6 rounded-xl font-bold text-base focus:outline-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Starting Generation...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate UI Prototype
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

