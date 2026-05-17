import type { Metadata } from "next";
import { IBM_Plex_Mono, Saira, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import AppToaster from "../components/ui/Toaster";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Site configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yiwang24.dev";
const siteName = "Yi Wang | Full Stack & AI Engineer";
const authorName = "Yi Wang";
const authorEmail = "yiwang2457@gmail.com";

export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  // Basic metadata
  title: {
    default: siteName,
    template: "%s | Yi Wang",
  },
  description:
    "Full Stack & AI Engineer specializing in Spring AI, enterprise Java microservices, and autonomous agent systems. MSc in Applied Statistics building production-ready AI solutions.",
  keywords: [
    "Full Stack Developer",
    "AI Engineer",
    "Spring AI",
    "Java Developer",
    "React Developer",
    "TypeScript",
    "Enterprise Software",
    "Agentic AI",
    "RAG Systems",
    "Spring Boot",
    "Microservices",
    "Toronto Developer",
  ],
  authors: [{ name: authorName, url: siteUrl }],
  creator: authorName,
  publisher: authorName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteName,
    siteName: "Yi Wang Portfolio",
    description:
      "Full Stack & AI Engineer specializing in Spring AI, enterprise Java microservices, and autonomous agent systems.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Yi Wang - Full Stack & AI Engineer",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    site: "@wang_yi13857",
    creator: "@wang_yi13857",
    title: siteName,
    description:
      "Full Stack & AI Engineer specializing in Spring AI, enterprise Java microservices, and autonomous agent systems.",
    images: ["/opengraph-image.png"],
  },

  // App metadata
  applicationName: "Yi Wang Portfolio",
  category: "Portfolio",
  generator: "Next.js",

  // Manifest
  manifest: "/manifest.json",

  // Verification
  verification: {
    // google: "your-google-search-console-code",
    // yandex: "your-yandex-verification-code",
  },

  // Alternates
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-US": siteUrl,
    },
  },

  // Additional metadata
  metadataBase: new URL(siteUrl),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// JSON-LD Structured Data for Person
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: authorName,
  email: authorEmail,
  jobTitle: "Full Stack & AI Engineer",
  url: siteUrl,
  sameAs: [
    "https://github.com/YiWang24",
    "https://www.linkedin.com/in/yiwang2025/",
    "https://x.com/wang_yi13857",
  ],
  knowsAbout: [
    "Spring AI",
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "Next.js",
    "Microservices",
    "Agentic AI",
    "RAG Systems",
    "Python",
    "Data Science",
    "Azure",
    "Docker",
  ],
  alumniOf: ["York University", "Henan University of Economics and Law"],
  worksFor: {
    "@type": "Organization",
    name: "SREDSimplify",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${saira.variable} ${plexMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <AppToaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
