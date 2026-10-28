import type { Metadata } from "next";
import { FortExplorer } from "@/components/explorer/fort-explorer";
import { districtsWithForts, mapForts, profileStats } from "@/lib/forts";

export const metadata: Metadata = {
  title: "Maharashtra Fort Explorer — map, history and trek guides",
  description:
    "Explore 237 geolocated forts across Maharashtra on an interactive map, with district filters, nearby forts, reviewed profiles and source-linked history.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <FortExplorer
      forts={mapForts}
      districts={districtsWithForts}
      curatedCount={profileStats.curated}
    />
  );
}
