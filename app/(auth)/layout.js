import { Public_Sans } from 'next/font/google';
import '../globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Personal Finance App',
  description: 'Manage your personal finances effectively.',
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} antialiased`}>
        <div className="bg-beige-100">
          {/* <main className="px-10 py-8"> */}
          {children}
          {/* </main> */}
        </div>
      </body>
    </html>
  );
}
