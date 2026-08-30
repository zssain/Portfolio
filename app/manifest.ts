import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mohammed Zuhair Hussain — AI / ML Engineer",
    short_name: "Zuhair Hussain",
    description: "Portfolio of Mohammed Zuhair Hussain, AI / ML Engineer.",
    start_url: "/",
    display: "standalone",
    background_color: "#111214",
    theme_color: "#111214",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
