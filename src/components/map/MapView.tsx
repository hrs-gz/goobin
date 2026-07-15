"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  onClick?: () => void;
}

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  radiusMeters?: number;
  /** Render a draggable pin at center (builder location picker). */
  draggablePin?: boolean;
  onPinMove?: (lat: number, lng: number) => void;
  className?: string;
}

// A simple themed pin — avoids Leaflet's broken default marker asset paths.
function pinIcon(color: string) {
  return L.divIcon({
    className: "goobin-pin",
    html: `<span style="display:block;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 18],
  });
}

const ACCENT = "#e2836e";

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapView({
  center,
  zoom = 15,
  markers = [],
  radiusMeters,
  draggablePin,
  onPinMove,
  className,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />

      {radiusMeters != null && (
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: ACCENT,
            fillColor: ACCENT,
            fillOpacity: 0.1,
            weight: 1.5,
          }}
        />
      )}

      {draggablePin && (
        <Marker
          position={center}
          draggable
          icon={pinIcon(ACCENT)}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onPinMove?.(lat, lng);
            },
          }}
        />
      )}

      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={pinIcon(ACCENT)}
          eventHandlers={m.onClick ? { click: m.onClick } : undefined}
        />
      ))}
    </MapContainer>
  );
}
