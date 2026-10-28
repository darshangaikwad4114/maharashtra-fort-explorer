import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maharashtra Fort Explorer",
    short_name: "Fort Explorer",
    description:
      "An interactive map and field guide to the forts of Maharashtra.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#faf6ee",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
