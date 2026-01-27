import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Amaynu - Recommendation System",
  description: "Discover your next favorite films",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReactQueryProvider>
          <Navigation />
        {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
