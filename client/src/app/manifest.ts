import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruud Juffermans — Data Engineer",
    short_name: "Ruud Juffermans",
    description:
      "Portfolio van Ruud Juffermans, data engineer: projecten, artikelen en achtergrond.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
