import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeedbackLens",
  description: "Analyze Google Sheets feedback data with sentiment analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">FeedbackLens</span>
            <span className="text-xs text-gray-400 mt-1">
              powered by sentiment analysis
            </span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
