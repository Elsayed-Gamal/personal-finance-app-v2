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
          <div className="grid min-h-dvh min-w-0 bg-beige-100 pb-[52px] sm:pb-[74px] min-[1120px]:grid-cols-[300px_minmax(0,1fr)] min-[1120px]:pb-0">
            <Sidebar />
            <main
              id="main-content"
              tabIndex={-1}
              className="min-w-0 px-4 py-6 sm:px-10 sm:py-8 min-[1120px]:col-start-2"
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
