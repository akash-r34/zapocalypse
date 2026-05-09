import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/src/components/layout/ThemeProvider";
import { AuthProvider } from "@/src/lib/auth/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zapocalypse — Vertical AI Content Factory",
  description: "One piece of content. Ten platforms worth of output. The single-user vertical AI workspace built for the creator economy.",
  icons: {
    icon: "/logos/icon.png",
    apple: "/logos/icon.png",
  },
};

// Prevent flash of light mode on load — dark is the default.
// If user previously selected light, set it before React hydrates.
const themeScript = `(function(){try{var t=localStorage.getItem('zapocalypse-theme');if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
