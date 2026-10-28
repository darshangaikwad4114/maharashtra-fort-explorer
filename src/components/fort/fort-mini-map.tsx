"use client";

import dynamic from "next/dynamic";
import type { MiniMapProps } from "@/components/fort/mini-map-inner";

const MiniMap = dynamic(
  () => import("@/components/fort/mini-map-inner").then((mod) => mod.FortMiniMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-[linear-gradient(160deg,#efe7d7,#e2d7c3)]">
        <span className="size-6 animate-spin rounded-full border-2 border-line-strong border-t-saffron" />
      </div>
    ),
  },
);

export function FortMiniMap(props: MiniMapProps) {
  return <MiniMap {...props} />;
}
