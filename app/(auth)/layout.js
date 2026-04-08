import { Public_Sans } from 'next/font/google';
import '../globals.css';
import Image from 'next/image';
import { auth } from '@/app/_services/auth';
import { redirect } from 'next/navigation';
import { SpeedInsights } from '@vercel/speed-insights/next';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Personal Finance App',
  description: 'Manage your personal finances effectively.',
};

export default async function AuthLayout({ children }) {
  const session = await auth();
  if (session) redirect('/');
  return (
    <html lang="en">
      <body className={`${publicSans.variable} antialiased`}>
        <div className="bg-beige-100">
          <main className="p-5 min-h-screen flex items-center">
            <div className="h-[calc(100vh-40px)] w-140 bg-[url('@/app/_assets/images/login-image.png')] rounded-xl relative overflow-hidden max-[1210px]:hidden">
              <Image
                src="/assets/images/logo-large.svg"
                alt="Logo"
                className="px-8 py-10"
                width={186}
                height={102}
              />
              <div className="px-10 flex flex-col gap-6 absolute bottom-10 left-0">
                <h2
                  className="text-white"
                  style={{
                    font: 'var(--text-preset-1)',
                  }}
                >
                  Keep track of your money and save for your future
                </h2>
                <p
                  className="text-white"
                  style={{
                    font: 'var(--text-preset-4)',
                  }}
                >
                  Personal finance app puts you in control of your spending.
                  Track transactions, set budgets, and add to savings pots
                  easily.
                </p>
              </div>
            </div>
            {children}
            <SpeedInsights />
          </main>
        </div>
      </body>
    </html>
  );
}
