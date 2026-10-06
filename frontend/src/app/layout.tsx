import type { Metadata } from "next";
import { Space_Grotesk, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Code-a-thon '26 | Gnanamani College of Technology",
  description: "The Journey of a Coder — 3 Languages, 3 Rounds, 1 Champion. Annual Collegiate Coding Festival by the Department of Computer Science & Engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#FFD84D] selection:text-[#171717]">
        {children}
      </body>
    </html>
  );
}
