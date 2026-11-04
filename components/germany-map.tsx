"use client";

import { geoConicConformal, geoPath } from "d3-geo";
import { useEffect, useMemo, useState } from "react";

type DiscoveryMarker = { id: string; title: string; city?: string | null; latitude?: number | null; longitude?: number | null; category: string };
type GeoFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>>;
type MapData = { states: GeoFeatureCollection; country: GeoFeatureCollection; attribution: string; attributionUrl: string; licenseUrl: string };

const WIDTH = 400;
const HEIGHT = 500;
const colors: Record<string, string> = { BUSINESS_OPPORTUNITY: "#20b75a", OPERATIONAL_ISSUE: "#f5a623", STRATEGIC_ISSUE: "#f5a623", POLICY_REGULATION: "#8058df", NEWS: "#2c6ce6" };
const cities = [
  { name: "Hamburg", coordinates: [9.9937, 53.5511] as [number, number], dx: 10, dy: -9 },
  { name: "Berlin", coordinates: [13.405, 52.52] as [number, number], dx: 10, dy: -8 },
  { name: "Hannover", coordinates: [9.732, 52.3759] as [number, number], dx: -47, dy: 18 },
  { name: "Köln", coordinates: [6.9603, 50.9375] as [number, number], dx: 10, dy: 18 },
  { name: "Düsseldorf", coordinates: [6.7735, 51.2277] as [number, number], dx: -53, dy: -8 },
  { name: "Frankfurt", coordinates: [8.6821, 50.1109] as [number, number], dx: 10, dy: 19 },
  { name: "Leipzig", coordinates: [12.3731, 51.3397] as [number, number], dx: 10, dy: 18 },
  { name: "Stuttgart", coordinates: [9.1829, 48.7758] as [number, number], dx: 10, dy: 20 },
  { name: "München", coordinates: [11.582, 48.1351] as [number, number], dx: 10, dy: 20 },
];

export default function GermanyMap({ items, onSelect }: { items: DiscoveryMarker[]; onSelect: (id: string) => void }) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/map").then(async (response) => {
      if (!response.ok) throw new Error("Karte nicht verfügbar");
      return response.json();
    }).then((mapData) => { if (active) setData(mapData); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const drawing = useMemo(() => {
    if (!data) return null;
    const projection = geoConicConformal().parallels([47, 55]).rotate([-10.4, 0]).fitExtent([[52, 18], [348, 468]], data.country);
    const path = geoPath(projection);
    return {
      countryPath: path(data.country) || "",
      statePaths: data.states.features.map((feature) => ({ id: String(feature.id ?? feature.properties?.ags ?? feature.properties?.gen), path: path(feature) || "" })),
      cities: cities.map((city) => ({ ...city, point: projection(city.coordinates) })),
      markers: items.filter((item) => item.latitude != null && item.longitude != null).map((item) => ({ item, point: projection([item.longitude!, item.latitude!]) })),
    };
  }, [data, items]);

  if (error) return <div className="map-status">Die offiziellen Kartendaten des BKG sind vorübergehend nicht verfügbar.</div>;
  if (!drawing || !data) return <div className="map-status">Offizielle Deutschlandkarte wird geladen…</div>;

  return <div className="germany-map">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Genaue Deutschlandkarte mit ${drawing.markers.length} Fundstellen`}>
      <defs><filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#7891b5" floodOpacity=".17"/></filter></defs>
      <g filter="url(#map-shadow)">{drawing.statePaths.map((state) => <path key={`fill-${state.id}`} d={state.path} className="state-fill"/>)}</g>
      <g>{drawing.statePaths.map((state) => <path key={`border-${state.id}`} d={state.path} className="state-border"/>)}</g>
      <path d={drawing.countryPath} className="country-outline"/>
      {drawing.cities.map((city) => city.point && <text key={city.name} x={city.point[0] + city.dx} y={city.point[1] + city.dy} className="map-city">{city.name}</text>)}
      {drawing.markers.map(({ item, point }) => point && <g key={item.id} className="map-marker" role="button" tabIndex={0} onClick={() => onSelect(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(item.id); }}><title>{item.title}</title><circle cx={point[0]} cy={point[1]} r="12" fill={colors[item.category] || colors.NEWS} opacity=".16"/><circle cx={point[0]} cy={point[1]} r="7" fill={colors[item.category] || colors.NEWS} stroke="white" strokeWidth="3"/></g>)}
    </svg>
    <div className="map-attribution"><a href={data.attributionUrl} target="_blank" rel="noreferrer">{data.attribution}</a> · <a href={data.licenseUrl} target="_blank" rel="noreferrer">Lizenz</a></div>
  </div>;
}
