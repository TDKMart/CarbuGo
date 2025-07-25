import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer as LeafletMap, TileLayer, useMapEvents } from "react-leaflet";
import { StationCluster } from "./station-cluster";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Crosshair } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import type { Station } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface OptimizedMapContainerProps {
  onStationClick: (stationId: string) => void;
  selectedStationId?: string | null;
  isLoading?: boolean;
  isFavorite?: (stationId: string) => boolean;
}

// Composant pour capturer les événements de la carte
function MapEventHandler({ 
  onBoundsChange 
}: { 
  onBoundsChange: (bounds: any, zoom: number) => void 
}) {
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

export function OptimizedMapContainer({ 
  onStationClick, 
  selectedStationId, 
  isLoading,
  isFavorite 
}: OptimizedMapContainerProps) {
  const mapRef = useRef<any>(null);
  const [bounds, setBounds] = useState({
    north: 49.5,
    south: 41.3,
    east: 9.6,
    west: -5.2
  });
  const [zoom, setZoom] = useState(6);

  // Debounce bounds changes to reduce API calls
  const debouncedBounds = useDebounce(bounds, 300);

  // Fetch stations only for visible area
  const { data: stations = [], isLoading: stationsLoading } = useQuery<Station[]>({
    queryKey: ["/api/stations/bounds", debouncedBounds],
    queryFn: async () => {
      const params = new URLSearchParams({
        north: debouncedBounds.north.toString(),
        south: debouncedBounds.south.toString(),
        east: debouncedBounds.east.toString(),
        west: debouncedBounds.west.toString(),
      });
      
      const response = await fetch(`/api/stations/bounds?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      return response.json();
    },
    enabled: zoom > 5, // Only fetch when zoomed in enough
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleBoundsChange = useCallback((newBounds: any, newZoom: number) => {
    setBounds(newBounds);
    setZoom(newZoom);
  }, []);

  // Centre sur Paris par défaut
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const defaultZoom = 6;

  const handleCenterMap = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 14);
          }
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error);
          // Fallback vers le centre de Paris
          if (mapRef.current) {
            mapRef.current.setView(defaultCenter, 12);
          }
        }
      );
    } else {
      console.log("Géolocalisation non disponible");
      if (mapRef.current) {
        mapRef.current.setView(defaultCenter, 12);
      }
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        
        {zoom > 5 && (
          <StationCluster
            stations={stations}
            zoom={zoom}
            bounds={bounds}
            onStationClick={onStationClick}
            selectedStationId={selectedStationId || undefined}
            isFavorite={isFavorite}
          />
        )}
      </LeafletMap>

      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50"
          onClick={handleCenterMap}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicateur de chargement */}
      {(isLoading || stationsLoading) && (
        <div className="absolute top-4 left-4 z-20 bg-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </div>
      )}

      {/* Zoom level indicator */}
      {zoom <= 5 && (
        <div className="absolute bottom-4 left-4 z-20 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg">
          <p className="text-sm text-yellow-800">
            Zoomez pour voir les stations
          </p>
        </div>
      )}
    </div>
  );
}