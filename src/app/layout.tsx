import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DOCUMIND AI — Evidence Intelligence Platform',
  description:
    'Intelligent Document Understanding, Multi-Passage Reasoning, Cross-Document Contradiction Discovery & Traceable Evidence Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
