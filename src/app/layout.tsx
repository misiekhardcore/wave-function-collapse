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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
