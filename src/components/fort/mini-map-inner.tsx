"use client";

import { MapContainer, Marker, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createFortIcon } from "@/components/explorer/map-icons";

export type MiniMapProps = {
  lat: number;
  lon: number;
  name: string;
  flagged: boolean;
};

export function FortMiniMapInner({ lat, lon, name, flagged }: MiniMapProps) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={12}
      minZoom={5}
      maxZoom={17}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <Marker
        position={[lat, lon]}
        icon={createFortIcon(
          { coordinateStatus: flagged ? "flagged" : "inside" },
          true,
        )}
        title={name}
        alt={name}
        keyboard
      />
    </MapContainer>
  );
}
