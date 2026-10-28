export type Bilingual = { en: string; mr: string };

export type FortCategory = "hill" | "sea" | "land" | "pinnacle";

export type Difficulty = "easy" | "moderate" | "hard" | "very_hard";

export type ProfileStatus = "curated" | "catalog";

export type CoordinateStatus = "inside" | "nearest-boundary" | "flagged";

export type HeritageClass =
  | "maratha"
  | "nizam_shahi"
  | "yadava"
  | "shilahara"
  | "siddi"
  | "sultanate"
  | "portuguese"
  | "british";

export type Season = { from: number; to: number };

export type FortSource = {
  title: string;
  url: string;
  publisher?: string;
};

export type FortImage = {
  src: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  caption: string | null;
};

export type Fort = {
  id: string;
  slug: string;
  name: string;
  nameMr: string | null;
  aliases: string[];
  lat: number;
  lon: number;
  district: string | null;
  districtAka: string | null;
  districtSlug: string | null;
  districtNote: string | null;
  districtMethod: "inside" | "nearest-boundary" | "unassigned";
  districtDistanceKm: number | null;
  category: FortCategory | null;
  heritageClass: HeritageClass | null;
  elevationM: number | null;
  difficulty: Difficulty | null;
  bestSeason: Season | null;
  built: string | null;
  accessibility: Bilingual | null;
  description: Bilingual | null;
  travel: Bilingual | null;
  profileStatus: ProfileStatus;
  coordinateStatus: CoordinateStatus;
  locationWarning: string | null;
  flags: string[];
  duplicateOf: string[];
  sources: FortSource[];
  image: FortImage | null;
  featured: boolean;
  reviewedOn: string | null;
  sourceRow: number;
};

export type District = {
  name: string;
  aka: string | null;
  slug: string;
  fortCount: number;
};

export type MapFort = {
  slug: string;
  name: string;
  nameMr: string | null;
  aliases: string[];
  lat: number;
  lon: number;
  district: string | null;
  districtSlug: string | null;
  category: FortCategory | null;
  difficulty: Difficulty | null;
  profileStatus: ProfileStatus;
  coordinateStatus: CoordinateStatus;
  locationWarning: string | null;
  image: string | null;
  featured: boolean;
  elevationM: number | null;
};
