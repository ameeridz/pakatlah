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
  title: {
    default: "Pakatlah",
    template: "%s | Pakatlah",
  },
  description:
    "Cari pilihan yang semua boleh terima dengan lebih mudah.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
