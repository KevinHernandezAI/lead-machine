import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Service Lead Machine',
  description: 'High-converting local service websites with lead capture and instant notifications.',
  openGraph: {
    title: 'Local Service Lead Machine',
    description: 'Done-for-you lead machine for local businesses.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
