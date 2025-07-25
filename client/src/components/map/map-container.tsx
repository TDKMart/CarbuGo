import { useEffect, useRef } from "react";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import { StationMarker } from "./station-marker";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Crosshair } from "lucide-react";
import type { Station } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface MapContainerProps {
  stations: Station[];
  onStationClick: (stationId: string) => void;
  selectedStationId?: string | null;
  isLoading?: boolean;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export function MapContainer({ 
  stations, 
  onStationClick, 
  selectedStationId, 
  isLoading,
  onBoundsChange 
}: MapContainerProps) {
  const mapRef = useRef<any>(null);

  // Center on Paris by default
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const defaultZoom = 12;

  const handleCenterMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 14);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          // Fallback to Paris center
          if (mapRef.current) {
            mapRef.current.setView(defaultCenter, defaultZoom);
          }
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Component to handle map events
  function MapEventHandler() {
    const map = useMapEvents({
      load: (e) => {
        if (onBoundsChange) {
          const bounds = e.target.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      },
      moveend: (e) => {
        if (onBoundsChange) {
          const bounds = e.target.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      },
      zoomend: (e) => {
        if (onBoundsChange) {
          const bounds = e.target.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      },
    });

    // Trigger initial bounds when component mounts
    useEffect(() => {
      if (map && onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    }, [map, onBoundsChange]);

    return null;
  }

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler />
        
        {stations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            onClick={() => onStationClick(station.id)}
            isSelected={selectedStationId === station.id}
          />
        ))}
      </LeafletMap>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleCenterMap}
        >
          <Crosshair className="h-5 w-5 text-primary" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-5 w-5 text-gray-700" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-30">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-gray-600 text-sm">Chargement des stations...</span>
          </div>
        </div>
      )}
    </div>
  );
}
