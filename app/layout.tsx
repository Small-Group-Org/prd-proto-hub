import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "PRD-PROTO-HUB - UI Prototype Generator",
  description: "Submit PRDs and generate UI prototypes automatically",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

