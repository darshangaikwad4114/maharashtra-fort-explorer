import type { Metadata } from "next";
import { FortExplorer } from "@/components/explorer/fort-explorer";
import { districtsWithForts, mapForts } from "@/lib/forts";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <FortExplorer forts={mapForts} districts={districtsWithForts} />;
}
