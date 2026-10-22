import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import './styles.css';

const interTight = Inter_Tight({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Typseo Playground — Editor & SEO Toolkit',
  description: 'Explore the Typseo rich-text editor and live SEO analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interTight.variable}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
