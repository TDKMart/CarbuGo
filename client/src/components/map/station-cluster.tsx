import React, { useMemo } from 'react';
import { StationMarker } from './station-marker';
import { ClusterMarker } from './cluster-marker';
import type { Station } from "@shared/schema";

interface StationClusterProps {
  stations: Station[];
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  onStationClick: (stationId: string) => void;
  selectedStationId?: string;
  isFavorite?: (stationId: string) => boolean;
}

interface ClusterGroup {
  stations: Station[];
  lat: number;
  lng: number;
}

export function StationCluster({ 
  stations, 
  zoom, 
  bounds, 
  onStationClick, 
  selectedStationId,
  isFavorite 
}: StationClusterProps) {
  
  // Filtre les stations dans les limites visibles
  const visibleStations = useMemo(() => {
    return stations.filter(station => 
      station.lat >= bounds.south &&
      station.lat <= bounds.north &&
      station.lon >= bounds.west &&
      station.lon <= bounds.east
    );
  }, [stations, bounds]);

  // Détermine s'il faut faire du clustering selon le zoom
  const shouldCluster = zoom < 12;
  const clusterDistance = zoom < 8 ? 0.05 : zoom < 10 ? 0.02 : 0.01;

  const { clusters, singleStations } = useMemo(() => {
    if (!shouldCluster) {
      return { clusters: [], singleStations: visibleStations };
    }

    const clustered: ClusterGroup[] = [];
    const processed = new Set<string>();
    const singles: Station[] = [];

    visibleStations.forEach(station => {
      if (processed.has(station.id)) return;

      // Trouve les stations proches
      const nearbyStations = visibleStations.filter(other => {
        if (processed.has(other.id) || other.id === station.id) return false;
        
        const distance = Math.sqrt(
          Math.pow(station.lat - other.lat, 2) + 
          Math.pow(station.lon - other.lon, 2)
        );
        
        return distance <= clusterDistance;
      });

      if (nearbyStations.length > 0) {
        // Crée un cluster
        const allStations = [station, ...nearbyStations];
        const centerLat = allStations.reduce((sum, s) => sum + s.lat, 0) / allStations.length;
        const centerLng = allStations.reduce((sum, s) => sum + s.lon, 0) / allStations.length;
        
        clustered.push({
          stations: allStations,
          lat: centerLat,
          lng: centerLng,
        });

        // Marque toutes les stations comme traitées
        allStations.forEach(s => processed.add(s.id));
      } else {
        // Station isolée
        singles.push(station);
        processed.add(station.id);
      }
    });

    return { clusters: clustered, singleStations: singles };
  }, [visibleStations, shouldCluster, clusterDistance]);

  return (
    <>
      {/* Affiche les clusters */}
      {clusters.map((cluster, index) => (
        <ClusterMarker
          key={`cluster-${index}`}
          stations={cluster.stations}
          lat={cluster.lat}
          lng={cluster.lng}
          onClick={() => {
            // Pour l'instant, on clique sur la première station du cluster
            // On pourrait afficher une liste des stations du cluster
            if (cluster.stations.length > 0) {
              onStationClick(cluster.stations[0].id);
            }
          }}
        />
      ))}

      {/* Affiche les stations individuelles */}
      {singleStations.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          onClick={() => onStationClick(station.id)}
          isSelected={selectedStationId === station.id}
          isFavorite={isFavorite ? isFavorite(station.id) : false}
        />
      ))}
    </>
  );
}