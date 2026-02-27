import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cinzel = localFont({
  src: [
    { path: "../../public/fonts/Cinzel-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Cinzel-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Cinzel-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorantGaramond = localFont({
  src: [
    { path: "../../public/fonts/CormorantGaramond-300.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/CormorantGaramond-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/CormorantGaramond-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/CormorantGaramond-300italic.woff2", weight: "300", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-300.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/JetBrainsMono-400.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harmonic Waves \u2014 Command Centre",
  description: "Ambient wall dashboard for sound healing \u2014 live Earth and cosmic data",
  robots: { index: false, follow: false },
  other: {
    "theme-color": "#050810",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
