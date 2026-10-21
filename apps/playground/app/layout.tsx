import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Typseo Playground',
  description: 'Try the Typseo rich-text editor and React SDK',
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
