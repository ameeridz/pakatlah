import Script from "next/script";
import "./globals.css";

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("pakatlah-theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = savedTheme || (systemPrefersDark ? "dark" : "light");

      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export const metadata = {
  applicationName: "Pakatlah",
  title: {
    default: "Pakatlah",
    template: "%s | Pakatlah",
  },
  description:
    "Buat pilihan bersama dan cari keputusan yang sesuai untuk semua.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Pakatlah",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    siteName: "Pakatlah",
    title: "Pakatlah",
    description:
      "Buat pilihan bersama dan cari keputusan yang sesuai untuk semua.",
  },
  twitter: {
    card: "summary",
    title: "Pakatlah",
    description:
      "Buat pilihan bersama dan cari keputusan yang sesuai untuk semua.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f8faf4",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0d120c",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ms"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <Script
          id="pakatlah-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        {children}
      </body>
    </html>
  );
}
