import type {
  MetadataRoute,
} from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      "Mighty Works Conference 2026",
    short_name:
      "Mighty Works 2026",
    description:
      "Mighty Works Conference 2026 — Greater Things.",
    start_url: "/",
    display: "standalone",
    background_color:
      "#0A0916",
    theme_color:
      "#0A0916",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
