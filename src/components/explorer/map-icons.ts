import L from "leaflet";
import type { Locale } from "@/lib/i18n";
import type { FortCategory, MapFort } from "@/types";

export const categoryColors: Record<FortCategory, string> = {
  hill: "#B85423",
  sea: "#2F6F7E",
  land: "#8C5A3C",
  pinnacle: "#34503F",
};

const categoryLabels: Record<FortCategory, string> = {
  hill: "Hill fort",
  sea: "Sea fort",
  land: "Land fort",
  pinnacle: "Pinnacle fort",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

const towerSvg = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M2 14V7.2l1.8-1V4h2v1.4h4.4V4h2v2.2l1.8 1V14"/><path d="M2 14h12"/><path d="M6.2 14v-3.2a1.8 1.8 0 0 1 3.6 0V14"/></svg>`;

export function fortDisplayName(
  fort: Pick<MapFort, "name" | "nameMr">,
  locale: Locale,
) {
  return locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;
}

export function createFortIcon(
  fort: Pick<MapFort, "category" | "coordinateStatus">,
  selected = false,
) {
  const color = fort.category ? categoryColors[fort.category] : "#4B4237";
  const classes = [
    "fort-pin__dot",
    selected ? "fort-pin--selected" : "",
    fort.coordinateStatus === "flagged" ? "fort-pin--disputed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "fort-pin",
    html: `<div class="${classes}" style="background:${color}"><span>${towerSvg}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 27],
    tooltipAnchor: [0, -22],
  });
}

export function createMiniIcon(category: FortCategory | null) {
  return createFortIcon({ category, coordinateStatus: "inside" }, true);
}

export function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const large = count >= 50;
  const size = count < 10 ? 38 : large ? 52 : 44;
  return L.divIcon({
    className: "cluster-marker",
    html: `<div class="cluster-marker__inner${large ? " cluster-marker__inner--lg" : ""}" style="width:${size}px;height:${size}px">${count}</div>`,
    iconSize: [size, size],
  });
}

export function fortTooltip(
  fort: Pick<MapFort, "name" | "nameMr" | "district" | "category">,
  locale: Locale,
) {
  const primary = fortDisplayName(fort, locale);
  const secondary =
    locale === "mr" ? fort.name : fort.nameMr ?? fort.district ?? "";
  const category = fort.category ? categoryLabels[fort.category] : "";
  const detail = [secondary !== primary ? secondary : "", category]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  return `<div class="font-sans"><strong>${escapeHtml(primary)}</strong>${
    detail ? `<br/><span style="opacity:.65;font-size:11px">${detail}</span>` : ""
  }</div>`;
}
