import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "sonner";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { SiteHeader } from "@/components/layout/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { developer, siteUrl } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-deva",
  display: "swap",
  // Only Marathi copy needs these glyphs, so preloading them on every English
  // page costs a request that never gets used.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maharashtra Fort Explorer — map, history and trek guides",
    template: "%s · Maharashtra Fort Explorer",
  },
  description:
    "Explore 237 geolocated forts across Maharashtra on an interactive map, with district filters, nearby forts, reviewed profiles and source-linked history.",
  applicationName: "Maharashtra Fort Explorer",
  keywords: [
    "Maharashtra forts",
    "Maratha forts",
    "Sahyadri treks",
    "fort map",
    "Raigad",
    "Sinhagad",
    "Trekking Maharashtra",
  ],
  authors: [{ name: developer.name, url: developer.portfolio }],
  creator: developer.name,
  publisher: developer.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: "mr_IN",
    siteName: "Maharashtra Fort Explorer",
    title: "Maharashtra Fort Explorer",
    description:
      "A field guide to the forts of Maharashtra: an interactive map, reviewed profiles and source-linked history.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Maharashtra Fort Explorer — a field guide to the forts of Maharashtra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maharashtra Fort Explorer",
    description:
      "An interactive map and field guide to the forts of Maharashtra.",
    images: ["/og.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#faf6ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-locale="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} ${notoDeva.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only-focusable absolute left-4 top-3 z-[100] rounded-full bg-ink px-4 py-2 text-sm text-parchment"
        >
          Skip to content
        </a>
        <LocaleProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <SiteHeader />
              <main id="main">{children}</main>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: "#231e19",
                    color: "#faf6ee",
                    border: "1px solid #4b4237",
                    borderRadius: "12px",
                  },
                }}
              />
              <PwaRegister />
            </TooltipProvider>
          </FavoritesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
