import type { Difficulty, FortSource } from "./fort";

export type Circuit = {
  slug: string;
  name: string;
  nameMr: string;
  summary: string;
  summaryMr: string;
  days: string;
  difficulty: Difficulty;
  season: string;
  seasonMr: string;
  fortSlugs: string[];
  note: string;
  noteMr: string;
};

export type TimelineEvent = {
  year: string;
  title: string;
  titleMr: string;
  description: string;
  descriptionMr: string;
  fortSlugs: string[];
  source: FortSource;
};
