import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "I'm A Servant First LLC | Premium Southern Catering",
    template: "%s | I'm A Servant First LLC",
  },
  description:
    "Upscale southern catering for weddings, corporate events, and private gatherings. Crafted with heart, served with excellence.",
  metadataBase: new URL("https://iasfcatering.com"),
  openGraph: {
    title: "I'm A Servant First LLC | Premium Southern Catering",
    description:
      "Upscale southern catering for weddings, corporate events, and private gatherings. Crafted with heart, served with excellence.",
    url: "https://iasfcatering.com",
    siteName: "I'm A Servant First LLC",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "I'm A Servant First LLC Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "I'm A Servant First LLC | Premium Southern Catering",
    description:
      "Upscale southern catering for weddings, corporate events, and private gatherings.",
    images: ["/logo.png"],
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
        className={`${playfair.variable} ${lato.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
