import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';

const geistSans = Geist({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const configuredOrigin = process.env.NEXT_PUBLIC_DOCS_SITE_URL;
export const metadata: Metadata = {
  title: { default: 'Typseo Docs', template: '%s | Typseo Docs' },
  description:
    'Documentation for the Typseo editor, SEO toolkit, and integrations.',
  // Local fallback keeps generated image URLs on the docs port during preview.
  // Production must provide the real origin; robots disallows indexing otherwise.
  metadataBase: new URL(configuredOrigin ?? 'http://localhost:3001'),
  openGraph: {
    title: 'Typseo Docs',
    description: 'Build an editor and SEO workflow that stays in your app.',
    type: 'website',
    siteName: 'Typseo Docs',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
