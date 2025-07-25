import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MapPin, Navigation, SortAsc, SortDesc, ExternalLink } from "lucide-react";
import type { Station } from "@shared/schema";

interface StationListPanelProps {
  stations: Station[];
  onStationClick: (stationId: string) => void;
  userLocation?: { lat: number; lon: number } | null;
}

type SortBy = "price" | "distance" | "name";

export function StationListPanel({ stations, onStationClick, userLocation }: StationListPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort stations based on current criteria
  const sortedStations = useMemo(() => {
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: userLocation 
        ? calculateDistance(userLocation.lat, userLocation.lon, station.lat, station.lon)
        : null
    }));

    return stationsWithDistance.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "price":
          const priceA = a.prixGazole || 999;
          const priceB = b.prixGazole || 999;
          comparison = priceA - priceB;
          break;
        case "distance":
          if (!a.distance || !b.distance) return 0;
          comparison = a.distance - b.distance;
          break;
        case "name":
          comparison = a.nom.localeCompare(b.nom);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [stations, sortBy, sortOrder, userLocation]);

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const formatPrice = (price: number | null) => {
    return price ? `${price.toFixed(3)} €/L` : "N/A";
  };

  const formatDistance = (distance: number | null) => {
    if (!distance) return "N/A";
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const getPriceColorClass = (price: number | null) => {
    if (!price) return "text-gray-500";
    if (price < 1.65) return "text-success";
    if (price > 1.80) return "text-error";
    return "text-warning";
  };

  const getPriceBadgeVariant = (price: number | null) => {
    if (!price) return "secondary";
    if (price < 1.65) return "default";
    if (price > 1.80) return "destructive";
    return "secondary";
  };

  const openGoogleMapsDirections = (station: Station) => {
    const destination = `${station.lat},${station.lon}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodeURIComponent(station.nom)}`;
    window.open(url, '_blank');
  };

  const handlePanelToggle = () => {
    if (isFullScreen) {
      setIsFullScreen(false);
      setIsExpanded(false);
    } else if (isExpanded) {
      setIsFullScreen(true);
    } else {
      setIsExpanded(true);
    }
  };

  const handleOverlayClick = () => {
    if (isFullScreen) {
      setIsFullScreen(false);
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    // Si on tire vers le haut (diff > 0)
    if (diff > 30) {
      if (!isExpanded) {
        setIsExpanded(true);
      } else if (isExpanded && !isFullScreen) {
        setIsFullScreen(true);
      }
      setIsDragging(false);
    }
    // Si on tire vers le bas (diff < 0)
    else if (diff < -30) {
      if (isFullScreen) {
        setIsFullScreen(false);
      } else if (isExpanded) {
        setIsExpanded(false);
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Overlay when expanded or fullscreen */}
      {(isExpanded || isFullScreen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-[1000]"
          onClick={handleOverlayClick}
        />
      )}

      {/* Panel */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-[1001] transition-all duration-300 ${
        isFullScreen 
          ? 'top-20 rounded-t-2xl flex flex-col' 
          : isExpanded 
            ? 'transform translate-y-0 rounded-t-2xl max-h-96' 
            : 'transform translate-y-[calc(100%-80px)] rounded-t-2xl'
      }`}>
        
        {/* Handle */}
        <div 
          className="flex items-center justify-center py-3 cursor-pointer border-b border-gray-200"
          onClick={handlePanelToggle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div 
          className="px-4 py-3 border-b border-gray-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">
                Stations ({stations.length})
              </h3>
              {!isExpanded && !isFullScreen && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {isExpanded && !isFullScreen && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullScreen(true);
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </div>
            {(isExpanded || isFullScreen) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFullScreen) {
                    setIsFullScreen(false);
                    setIsExpanded(true);
                  } else {
                    setIsExpanded(false);
                  }
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Quick stats when collapsed */}
          {!isExpanded && !isFullScreen && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>Prix le plus bas: {formatPrice(Math.min(...stations.filter(s => s.prixGazole).map(s => s.prixGazole!)))}</span>
              {userLocation && (
                <span>Station la plus proche: {formatDistance(Math.min(...sortedStations.filter(s => s.distance).map(s => s.distance!)))}</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {(isExpanded || isFullScreen) && (
          <div className={`overflow-y-auto ${isFullScreen ? 'flex-1' : 'max-h-96'}`}>
            {/* Sort Controls */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trier par:</span>
                <Button
                  variant={sortBy === "price" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort("price")}
                  className="flex items-center space-x-1"
                >
                  <span>Prix</span>
                  {sortBy === "price" && (
                    sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </Button>
                {userLocation && (
                  <Button
                    variant={sortBy === "distance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("distance")}
                    className="flex items-center space-x-1"
                  >
                    <span>Distance</span>
                    {sortBy === "distance" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                )}
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-1"
                >
                  <span>Nom</span>
                  {sortBy === "name" && (
                    sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Station List */}
            <div className="divide-y divide-gray-200">
              {sortedStations.map((station) => (
                <div
                  key={station.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onStationClick(station.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 truncate">{station.nom}</h4>
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
                          <span>SP95: <span className={getPriceColorClass(station.prixSP95)}>{formatPrice(station.prixSP95)}</span></span>
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
        )}
      </div>
    </>
  );
}