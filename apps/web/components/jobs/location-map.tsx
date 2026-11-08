"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { Location } from "@skillconnect/domain";

const pin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:oklch(0.44 0.085 172);border:3px solid white;box-shadow:0 1px 4px rgb(0 0 0 / 0.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickToMove({ onChange, value }: { onChange: (next: Location) => void; value: Location }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng, label: value.label });
    },
  });
  return null;
}

export default function LocationMap({
  value,
  onChange,
}: {
  value: Location;
  onChange: (next: Location) => void;
}) {
  return (
    <div className="h-56 overflow-hidden rounded-2xl border border-border shadow-soft">
      <MapContainer
        center={[value.lat, value.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[value.lat, value.lng]}
          icon={pin}
          draggable
          eventHandlers={{
            dragend(event) {
              const { lat, lng } = event.target.getLatLng();
              onChange({ lat, lng, label: value.label });
            },
          }}
        />
        <ClickToMove value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
