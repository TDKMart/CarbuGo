import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Station } from "@shared/schema";

interface ClusterMarkerProps {
  stations: Station[];
  lat: number;
  lng: number;
  onClick?: () => void;
}

export function ClusterMarker({ stations, lat, lng, onClick }: ClusterMarkerProps) {
  // Trouve la station avec le prix gazole le plus bas du cluster
  const cheapestStation = stations.reduce((cheapest, station) => {
    if (!station.prixGazole) return cheapest;
    if (!cheapest?.prixGazole) return station;
    return station.prixGazole < cheapest.prixGazole ? station : cheapest;
  }, stations[0]);

  const getClusterColor = (price: number | null) => {
    if (!price) return '#6b7280'; // gris
    if (price < 1.65) return '#10b981'; // vert
    if (price > 1.80) return '#ef4444'; // rouge
    return '#f59e0b'; // orange
  };

  const color = getClusterColor(cheapestStation?.prixGazole || null);
  const count = stations.length;

  // Crée une icône de cluster personnalisée
  const clusterIcon = L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        +${count}
      </div>
    `,
    className: 'cluster-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <Marker
      position={[lat, lng]}
      icon={clusterIcon}
      eventHandlers={{
        click: onClick
      }}
    />
  );
}