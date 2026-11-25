import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { DemoBoard } from "@/components/demo/DemoBoard";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Non Slop hackathon — goobin",
  description: "A nine-square photo bingo board. Snap each prompt, keep the print.",
};

export const viewport: Viewport = {
  themeColor: "#EAE7D5",
};

export default function DemoPage() {
  return (
    <div
      className={`${fraunces.variable} ${grotesk.variable} ${plexMono.variable}`}
    >
      <DemoBoard />
    </div>
  );
}
