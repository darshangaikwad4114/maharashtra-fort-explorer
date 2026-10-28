import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { mapForts } from "@/lib/forts";
import { translate } from "@/lib/i18n";

export const metadata: Metadata = {
  title: translate("en", "favorites.title"),
  description: translate("en", "favorites.subtitle"),
  alternates: { canonical: "/favorites" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <FavoritesView forts={mapForts} />
      <SiteFooter />
    </>
  );
}
