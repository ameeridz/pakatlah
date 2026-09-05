export default function manifest() {
  return {
    name: "Pakatlah",
    short_name: "Pakatlah",
    description: "Buat pilihan bersama dan cari keputusan yang sesuai untuk semua.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0d120c",
    theme_color: "#65a30d",
    categories: ["productivity", "utilities", "social"],
    lang: "ms",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
