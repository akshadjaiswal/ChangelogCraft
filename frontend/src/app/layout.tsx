import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChangelogCraft - Turn commits into beautiful changelogs",
  description: "AI-powered changelog generator for GitHub repositories. Generate beautiful, user-friendly changelogs from your commit history instantly.",
  keywords: ["changelog", "github", "ai", "commit", "release notes", "version control"],
  authors: [{ name: "ChangelogCraft" }],
  openGraph: {
    type: "website",
    title: "ChangelogCraft - Turn commits into beautiful changelogs",
    description: "AI-powered changelog generator for GitHub repositories",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
