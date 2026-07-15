import type { Metadata, Viewport } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { colorModeScript } from "@/providers/ColorModeProvider";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "goobin — photo bingo",
    template: "%s — goobin",
  },
  description:
    "Turn any outing into a shareable photo bingo board. Join with a code, snap photos, get bingo.",
  applicationName: "goobin",
  openGraph: {
    type: "website",
    siteName: "goobin",
    title: "goobin — photo bingo",
    description:
      "Turn any outing into a shareable photo bingo board. Join with a code, snap photos, get bingo.",
  },
  twitter: {
    card: "summary",
    title: "goobin — photo bingo",
    description: "Turn any outing into a shareable photo bingo board.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#15151a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
