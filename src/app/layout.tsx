import type { Metadata } from 'next';
import { DM_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], weight: ['500', '600', '700'] });
const mono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Datta Vani CMS · prototype',
  description: 'Clickable prototype of the Datta Vani content management system, for team review.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[15px]">{children}</body>
    </html>
  );
}
