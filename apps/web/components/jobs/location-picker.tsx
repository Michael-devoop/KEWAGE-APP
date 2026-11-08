"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Location } from "@skillconnect/domain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Map = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-border bg-muted/40 text-xs text-muted-foreground">
      Loading map...
    </div>
  ),
});

export const ADDIS_SPOTS: Location[] = [
  { lat: 9.01, lng: 38.76, label: "Bole" },
  { lat: 9.018, lng: 38.77, label: "Kazanchis" },
  { lat: 9.03, lng: 38.74, label: "Piassa" },
  { lat: 9.03, lng: 38.8, label: "Megenagna" },
  { lat: 9.0, lng: 38.82, label: "Gerji" },
  { lat: 9.005, lng: 38.74, label: "Old Airport" },
  { lat: 8.995, lng: 38.78, label: "Saris" },
];

export function LocationPicker({
  value,
  onChange,
}: {
  value: Location;
  onChange: (next: Location) => void;
}) {
  const label = useMemo(() => value.label, [value.label]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ADDIS_SPOTS.map((spot) => {
          const active = spot.label === value.label;
          return (
            <button
              key={spot.label}
              type="button"
              onClick={() => onChange(spot)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 " +
                (active
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground")
              }
              aria-pressed={active}
            >
              {spot.label}
            </button>
          );
        })}
      </div>

      <Map value={value} onChange={onChange} />

      <div className="space-y-1.5">
        <Label htmlFor="location-label">Area name</Label>
        <Input
          id="location-label"
          value={label}
          onChange={(event) => onChange({ ...value, label: event.target.value })}
          placeholder="e.g. Bole, near Edna Mall"
        />
      </div>
    </div>
  );
}
