import L from "leaflet";
import type { Locale } from "@/lib/i18n";
import type { MapFort } from "@/types";

const PIN_COLOR = "#a94a1d";

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

export function createFortIcon(
  fort: Pick<MapFort, "coordinateStatus">,
  selected = false,
) {
  const classes = [
    "fort-pin__dot",
    selected ? "fort-pin--selected" : "",
    fort.coordinateStatus === "flagged" ? "fort-pin--disputed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "fort-pin",
    html: `<div class="${classes}" style="background:${PIN_COLOR}"><span>${towerSvg}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 27],
    tooltipAnchor: [0, -22],
  });
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
  fort: Pick<MapFort, "name" | "nameMr" | "district">,
  locale: Locale,
) {
  const name =
    locale === "mr" && fort.nameMr ? fort.nameMr : fort.name;
  const district = fort.district ? escapeHtml(fort.district) : "";
  return `<div><strong>${escapeHtml(name)}</strong>${
    district ? `<br/><span style="opacity:.65">${district}</span>` : ""
  }</div>`;
}
