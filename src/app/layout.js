import { Open_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

// Import fonts using next/font
const openSans = Open_Sans({
  variable: "--font-open-sans", // Define a variable for the font
  subsets: ["latin"],
  weights: [300, 400, 600, 700, 800], // Specify font weights you want to load
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Pinnacle Studios designs and builds standout websites for ambitious brands. Based in Pleasanton, CA, serving clients across the San Francisco Bay Area and beyond.";

export const metadata = {
  metadataBase: new URL("https://pinnaclestudios.co"),
  title: {
    default: "Pinnacle Studios | Web Design & Development Studio in the San Francisco Bay Area",
    template: "%s | Pinnacle Studios",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pinnacle Studios | Web Design & Development Studio",
    description: siteDescription,
    url: "https://pinnaclestudios.co",
    siteName: "Pinnacle Studios",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinnacle Studios | Web Design & Development Studio",
    description: siteDescription,
  },
};

// Local-business structured data: tells Google this is a real business with a
// physical service area (Pleasanton / SF Bay Area) without publishing a street
// address, per the level of detail we were given to work with.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Pinnacle Studios",
  url: "https://pinnaclestudios.co",
  image: "https://pinnaclestudios.co/PS%20Logo.svg",
  telephone: "+1-925-393-8060",
  email: "haider@pinnaclestudios.co",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pleasanton",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "Place",
    name: "San Francisco Bay Area",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for Google Fonts (optional with next/font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} antialiased`}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
