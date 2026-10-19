import { Public_Sans } from "next/font/google";
import "../globals.css";
import Sidebar from "../_UI/Sidebar";
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Personal Finance App",
  description: "Manage your personal finances effectively.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} antialiased`}>
        <SessionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-3"
          >
            Skip to content
          </a>
          <div className="grid min-h-dvh min-w-0 grid-rows-[auto_1fr] bg-beige-100 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-1">
            <Sidebar />
            <main
              id="main-content"
              tabIndex={-1}
              className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8"
            >
              {children}
            </main>
          </div>
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
