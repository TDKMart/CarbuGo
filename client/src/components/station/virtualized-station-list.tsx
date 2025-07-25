import { useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Star } from "lucide-react";
import { useVirtualList } from "@/hooks/use-virtual-list";
import type { Station } from "@shared/schema";

interface VirtualizedStationListProps {
  stations: Station[];
  onStationClick: (stationId: string) => void;
  userLocation?: { lat: number; lon: number } | null;
  isFavorite?: (stationId: string) => boolean;
  containerHeight: number;
}

const ITEM_HEIGHT = 120; // Height of each station item in pixels

export function VirtualizedStationList({ 
  stations, 
  onStationClick, 
  userLocation, 
  isFavorite,
  containerHeight 
}: VirtualizedStationListProps) {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Prepare stations with distance
  const stationsWithDistance = useMemo(() => {
    return stations.map(station => ({
      ...station,
      distance: userLocation 
        ? calculateDistance(userLocation.lat, userLocation.lon, station.lat, station.lon)
        : null
    }));
  }, [stations, userLocation, calculateDistance]);

  const {
    virtualItems,
    totalHeight,
    setScrollTop,
  } = useVirtualList(stationsWithDistance, {
    itemHeight: ITEM_HEIGHT,
    containerHeight,
    overscan: 5,
  });

  const formatPrice = useCallback((price: number | null) => {
    return price ? `${price.toFixed(3)} €/L` : "N/A";
  }, []);

  const formatDistance = useCallback((distance: number | null) => {
    if (!distance) return "N/A";
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }, []);

  const getPriceBadgeVariant = useCallback((price: number | null) => {
    if (!price) return "secondary";
    if (price < 1.65) return "default";
    if (price > 1.80) return "destructive";
    return "secondary";
  }, []);

  const openGoogleMapsDirections = useCallback((station: Station) => {
    const destination = `${station.lat},${station.lon}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodeURIComponent(station.nom)}`;
    window.open(url, '_blank');
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, [setScrollTop]);

  return (
    <div
      ref={scrollElementRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, item: station, offsetTop }) => (
          <div
            key={station.id}
            className="absolute left-0 right-0 px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            style={{
              top: offsetTop,
              height: ITEM_HEIGHT,
            }}
          >
            <div className="flex items-center justify-between h-full">
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onStationClick(station.id)}
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 truncate">{station.nom}</h4>
                  {isFavorite && isFavorite(station.id) && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                  <Badge variant={getPriceBadgeVariant(station.prixGazole)}>
                    {formatPrice(station.prixGazole)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{station.adresse}, {station.ville}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  {station.prixSP95 && (
                    <span>SP95: <span className="text-gray-700">{formatPrice(station.prixSP95)}</span></span>
                  )}
                  {station.distance && (
                    <span className="flex items-center space-x-1">
                      <Navigation className="h-3 w-3" />
                      <span>{formatDistance(station.distance)}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGoogleMapsDirections(station);
                  }}
                  className="flex items-center space-x-1"
                >
                  <Navigation className="h-3 w-3" />
                  <span className="hidden sm:inline">Itinéraire</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}