import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './styles.css';

export const metadata: Metadata = {
  title: 'Typseo Playground — Editor & SEO Toolkit',
  description: 'Explore the Typseo rich-text editor and live SEO analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
