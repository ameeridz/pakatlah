import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Pakatlah",
    template: "%s | Pakatlah",
  },
  description:
    "Cari pilihan yang paling ramai boleh ikut, bukan sekadar yang mendapat undi terbanyak.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}