import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WFC — Wave Function Collapse Visualizer | Generate Procedural Patterns & Tiles',
  description:
    'Interactive wave function collapse algorithm visualizer. Explore procedural pattern generation, tile-based algorithms, and visualize the WFC solving process in real-time with customizable grid sizes.',
  keywords: [
    'wave-function-collapse',
    'WFC',
    'procedural-generation',
    'pattern-algorithm',
    'tiling-systems',
    'algorithm-visualization',
    'nextjs-demo',
  ],
  authors: [{ name: 'Michael Konopski', url: 'https://github.com/misiekhardcore' }],
  openGraph: {
    title: 'Wave Function Collapse Visualizer',
    description:
      'Interactive wave function collapse algorithm visualizer. Explore procedural pattern generation, tile-based algorithms, and visualize the WFC solving process.',
    type: 'website',
    locale: 'en_US',
    url: 'https://wave-function-collapse.misiekhardcore.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WFC — Wave Function Collapse Visualizer',
    description:
      'Interactive wave function collapse algorithm visualizer. Explore procedural pattern generation and tile-based algorithms.',
  },
  // Explicit favicon and icon references
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  // Web app manifest
  manifest: '/manifest.json',
  // SEO robots
  robots: {
    index: true,
    follow: true,
  },
  // Alternate URLs
  alternates: {
    canonical: 'https://wave-function-collapse.misiekhardcore.dev',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: '#1a1a2e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Favicon links */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
