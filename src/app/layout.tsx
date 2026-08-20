import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AstroDB — Universal Astronomical Knowledge Base & AI Agent Gateway',
  description: 'Production Multi-Catalog Astronomical Database with relational SQL, pgvector semantic search, and MCP server for AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-space-cyan selection:text-space-950">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
