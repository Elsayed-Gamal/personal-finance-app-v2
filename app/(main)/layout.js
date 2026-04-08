import { Public_Sans } from 'next/font/google';
import '../globals.css';
import Sidebar from '../_UI/Sidebar';
import { SessionProvider } from 'next-auth/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Personal Finance App',
  description: 'Manage your personal finances effectively.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} antialiased`}>
        <SessionProvider>
          <div
            className="bg-beige-100 grid"
            style={{ gridTemplateColumns: '20% 80%' }}
          >
            <Sidebar />
            <main className="px-10 py-8">{children}</main>
          </div>
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
