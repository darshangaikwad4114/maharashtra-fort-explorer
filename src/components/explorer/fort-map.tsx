"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  Circle,
  CircleMarker,
  LayersControl,
  MapContainer,
  ScaleControl,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import {
  createClusterIcon,
  createFortIcon,
  fortDisplayName,
  fortTooltip,
} from "@/components/explorer/map-icons";
import type { Locale } from "@/lib/i18n";
import type { MapFort } from "@/types";

export type MapFocus = {
  lat: number;
  lon: number;
  zoom: number;
  nonce: number;
};

export type UserLocation = {
  lat: number;
  lon: number;
  accuracy?: number;
};

type FortMapProps = {
  forts: MapFort[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  focus: MapFocus | null;
  userLocation: UserLocation | null;
  locale: Locale;
  label: string;
};

const TILES = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
};

const MAHARASHTRA_CENTER: [number, number] = [19.6, 75.7];

export function FortMap({
  forts,
  selectedSlug,
  onSelect,
  focus,
  userLocation,
  locale,
  label,
}: FortMapProps) {
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const fortBySlug = useMemo(
    () => new Map(forts.map((fort) => [fort.slug, fort])),
    [forts],
  );

  return (
    <MapContainer
      center={MAHARASHTRA_CENTER}
      zoom={7}
      minZoom={5}
      maxZoom={18}
      zoomControl={false}
      scrollWheelZoom
      className="explorer-map h-full w-full"
    >
      <MapA11yLabel label={label} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url={TILES.osm.url}
            attribution={TILES.osm.attribution}
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Topographic">
          <TileLayer
            url={TILES.topo.url}
            attribution={TILES.topo.attribution}
            maxZoom={17}
            className="map-tile-topo"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url={TILES.satellite.url}
            attribution={TILES.satellite.attribution}
            maxZoom={18}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <ZoomControl position="bottomright" />
      <ScaleControl position="bottomleft" imperial={false} />
      <FitMaharashtra disabled={Boolean(focus)} />
      <MapFocus focus={focus} />
      <MapClickHandler onClear={() => onSelectRef.current(null)} />

      <ClusterLayer
        forts={forts}
        locale={locale}
        groupRef={groupRef}
        markersRef={markersRef}
        onSelect={(slug) => onSelectRef.current(slug)}
      />

      <SelectionSync
        groupRef={groupRef}
        markersRef={markersRef}
        fortBySlug={fortBySlug}
        selectedSlug={selectedSlug}
      />

      {userLocation ? (
        <UserMarker location={userLocation} locale={locale} />
      ) : null}
    </MapContainer>
  );
}

function ClusterLayer({
  forts,
  locale,
  groupRef,
  markersRef,
  onSelect,
}: {
  forts: MapFort[];
  locale: Locale;
  groupRef: React.RefObject<L.MarkerClusterGroup | null>;
  markersRef: React.RefObject<Map<string, L.Marker>>;
  onSelect: (slug: string) => void;
}) {
  const map = useMap();
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 120,
      maxClusterRadius: 52,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: createClusterIcon,
    });

    groupRef.current = group;
    markersRef.current = new Map();
    map.addLayer(group);

    return () => {
      map.removeLayer(group);
      groupRef.current = null;
      markersRef.current = new Map();
    };
  }, [map, groupRef, markersRef]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.clearLayers();
    markersRef.current.clear();

    for (const fort of forts) {
      const marker = L.marker([fort.lat, fort.lon], {
        icon: createFortIcon(fort),
        title: `${fort.name}${fort.district ? ` — ${fort.district}` : ""}`,
        alt: fort.name,
        keyboard: true,
        riseOnHover: true,
      });

      marker.bindTooltip(fortTooltip(fort, locale), {
        direction: "top",
        offset: [0, -4],
        opacity: 1,
        className: "fort-tooltip",
      });

      marker.on("click", () => onSelectRef.current(fort.slug));
      markersRef.current.set(fort.slug, marker);
      group.addLayer(marker);
    }

    return () => {
      group.clearLayers();
      markersRef.current.clear();
    };
  }, [forts, locale, groupRef, markersRef]);

  return null;
}

function SelectionSync({
  groupRef,
  markersRef,
  fortBySlug,
  selectedSlug,
}: {
  groupRef: React.RefObject<L.MarkerClusterGroup | null>;
  markersRef: React.RefObject<Map<string, L.Marker>>;
  fortBySlug: Map<string, MapFort>;
  selectedSlug: string | null;
}) {
  const map = useMap();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const markers = markersRef.current;
    const prev = previous.current;

    if (prev && prev !== selectedSlug) {
      const marker = markers.get(prev);
      const fort = fortBySlug.get(prev);
      if (marker && fort) marker.setIcon(createFortIcon(fort, false));
    }

    if (!selectedSlug) {
      previous.current = null;
      return;
    }

    const marker = markers.get(selectedSlug);
    const fort = fortBySlug.get(selectedSlug);
    if (!marker || !fort) {
      previous.current = selectedSlug;
      return;
    }

    marker.setIcon(createFortIcon(fort, true));
    previous.current = selectedSlug;

    let cancelled = false;
    let timer = 0;
    let attempts = 0;

    const reveal = () => {
      if (cancelled) return;
      const group = groupRef.current;
      if (!group) return;

      // markercluster builds its grid in chunks, so a fresh marker has no
      // parent yet; and zoomToShowLayer leaves a map-level moveend handler
      // behind that crashes if the layer is cleared mid-animation.
      const animating = (map as unknown as { _animatingZoom?: boolean })
        ._animatingZoom;
      const parent = (marker as unknown as { __parent?: unknown }).__parent;
      if ((animating || !parent) && attempts < 12) {
        attempts += 1;
        timer = window.setTimeout(reveal, 150);
        return;
      }

      if (map.hasLayer(marker)) {
        marker.openTooltip();
      } else if (group.hasLayer(marker) && parent) {
        group.zoomToShowLayer(marker, () => {
          if (!cancelled) marker.openTooltip();
        });
      } else {
        map.flyTo([fort.lat, fort.lon], Math.max(map.getZoom(), 11), {
          duration: 0.6,
        });
        map.once("moveend", () => {
          if (!cancelled && map.hasLayer(marker)) marker.openTooltip();
        });
      }
    };

    timer = window.setTimeout(reveal, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedSlug, fortBySlug, map, groupRef, markersRef]);

  return null;
}

function FitMaharashtra({ disabled }: { disabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (disabled) return;

    const bounds = L.latLngBounds([
      [15.55, 72.55],
      [22.15, 80.95],
    ]);
    let lastWidth = 0;
    let frame = 0;

    const fit = () => {
      const container = map.getContainer();
      if (!container.isConnected) return;
      const width = map.getSize().x;
      if (!width) return;
      map.stop();
      map.invalidateSize();
      const boundsZoom = map.getBoundsZoom(bounds, false, L.point(32, 32));
      // A portrait phone can only fit the full state at zoom 5, which shows
      // most of India. Cap the initial zoom so Maharashtra fills the width.
      const zoom = width < 640 ? Math.max(boundsZoom, 6) : boundsZoom;
      map.setView(bounds.getCenter(), zoom, { animate: false });
      lastWidth = width;
    };

    // Wait a frame so the flex layout has settled before measuring.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(fit);
    });

    const observer = new ResizeObserver(() => {
      if (Math.abs(map.getSize().x - lastWidth) > 24) fit();
    });
    observer.observe(map.getContainer());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map, disabled]);

  return null;
}

function MapA11yLabel({ label }: { label: string }) {
  const map = useMap();

  useEffect(() => {
    // MapContainer does not forward arbitrary attributes to Leaflet's own
    // container, and the container is keyboard-focusable.
    map.getContainer().setAttribute("aria-label", label);
  }, [map, label]);

  return null;
}

function MapFocus({ focus }: { focus: MapFocus | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lon], focus.zoom, {
      duration: 0.85,
      easeLinearity: 0.25,
    });
  }, [focus, map]);

  return null;
}

function MapClickHandler({ onClear }: { onClear: () => void }) {
  useMapEvents({
    click: () => onClear(),
  });
  return null;
}

function UserMarker({
  location,
  locale,
}: {
  location: UserLocation;
  locale: Locale;
}) {
  return (
    <>
      <CircleMarker
        center={[location.lat, location.lon]}
        radius={7}
        pathOptions={{
          color: "#2F6F7E",
          fillColor: "#2F6F7E",
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Tooltip direction="top">
          {locale === "mr" ? "तुमचे स्थान" : "Your location"}
        </Tooltip>
      </CircleMarker>
      {location.accuracy ? (
        <Circle
          center={[location.lat, location.lon]}
          radius={Math.min(location.accuracy, 2000)}
          pathOptions={{
            color: "#2F6F7E",
            fillColor: "#2F6F7E",
            fillOpacity: 0.08,
            weight: 1,
          }}
        />
      ) : null}
    </>
  );
}

export { fortDisplayName };
