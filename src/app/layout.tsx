import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { AppHeader, ThemeProvider } from '@/components';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
      { url: '/icon.svg', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#252525' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('h-full', inter.variable)}>
      <body className="min-h-svh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-svh flex-col">
            <AppHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
