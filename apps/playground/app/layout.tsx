import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Typseo Playground',
  description: 'M0 workspace playground for Typseo',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
