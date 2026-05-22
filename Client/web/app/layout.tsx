import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "JayKia | Executive Airport Transfers in Nairobi",
    template: "%s | JayKia",
  },
  description:
    "Premium executive airport transfer service at JKIA, Nairobi. Fixed pricing, professional drivers, branded vehicles. Arrive happy, travel free.",
  keywords: [
    "JKIA transfers",
    "Nairobi airport transfer",
    "executive car service Kenya",
    "airport pickup Nairobi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
