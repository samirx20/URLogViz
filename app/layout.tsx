import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Header } from "@/components/header";
import { AnalysisProvider } from "@/context/analysis-context";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "URLogViz", // Changed title
  description: "Visualize Universal Robot Log Files", // Changed description
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalysisProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow flex flex-col items-center">
                {children}
              </main>
            </div>
          </AnalysisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
