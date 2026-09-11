import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shop Thập Cẩm Komura',
  description: 'Uy tín - An toàn - chất lượng',
  openGraph: {
    title: 'Shop Thập Cẩm Komura',
    description: 'Uy tín - An toàn - chất lượng',
    url: 'https://komurashop.vercel.app',
    siteName: 'Shop Thập Cẩm Komura',
    images: [
      {
        url: 'https://cdn.upanhlaylink.com/i/OnwBaJga.jpeg',
        width: 1200,
        height: 630,
        alt: 'Shop Thập Cẩm Komura',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Thập Cẩm Komura',
    description: 'Uy tín - An toàn - chất lượng',
    images: ['https://cdn.upanhlaylink.com/i/OnwBaJga.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
