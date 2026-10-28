const EARTH_RADIUS_KM = 6371.0088;

type Point = { lat: number; lon: number };

/** Great-circle distance in kilometres. */
export function distanceKm(a: Point, b: Point) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number, locale: "en" | "mr" = "en") {
  if (km < 1) {
    const metres = Math.round(km * 1000);
    return locale === "mr" ? `${metres} मी` : `${metres} m`;
  }
  if (km < 10) {
    return locale === "mr" ? `${km.toFixed(1)} किमी` : `${km.toFixed(1)} km`;
  }
  return locale === "mr"
    ? `${Math.round(km).toLocaleString("en-IN")} किमी`
    : `${Math.round(km).toLocaleString("en-IN")} km`;
}

export function mapsDirectionsUrl(fort: { lat: number; lon: number; name: string }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${fort.lat},${fort.lon}&travelmode=driving`;
}

export function osmUrl(fort: { lat: number; lon: number }) {
  return `https://www.openstreetmap.org/?mlat=${fort.lat}&mlon=${fort.lon}#map=14/${fort.lat}/${fort.lon}`;
}
