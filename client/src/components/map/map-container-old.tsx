import { useEffect, useRef, useState } from "react";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import { StationCluster } from "./station-cluster";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Minus, Crosshair } from "lucide-react";
import type { Station } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface MapContainerProps {
  stations: Station[];
  onStationClick: (stationId: string) => void;
  selectedStationId?: string | null;
  isLoading?: boolean;
  isFavorite?: (stationId: string) => boolean;
}

// Composant pour capturer les événements de la carte
function MapEventHandler({ onBoundsChange }: { onBoundsChange: (bounds: any, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }, zoom);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }, zoom);
    },
  });
  return null;
}

export function MapContainer({ 
  stations, 
  onStationClick, 
  selectedStationId, 
  isLoading,
  isFavorite 
}: MapContainerProps) {
  const mapRef = useRef<any>(null);
  const [bounds, setBounds] = useState({
    north: 49.5,
    south: 41.3,
    east: 9.6,
    west: -5.2
  });
  const [zoom, setZoom] = useState(6);

  const handleBoundsChange = (newBounds: any, newZoom: number) => {
    setBounds(newBounds);
    setZoom(newZoom);
  };

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
        

        
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        
        <StationCluster
          stations={stations}
          zoom={zoom}
          bounds={bounds}
          onStationClick={onStationClick}
          selectedStationId={selectedStationId}
          isFavorite={isFavorite}
        />
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
