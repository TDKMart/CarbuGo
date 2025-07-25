import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer } from "@/components/map/map-container";
import { SearchBar } from "@/components/search/search-bar";
import { StationDetails } from "@/components/station/station-details";
import { StationListPanel } from "@/components/station/station-list-panel";
import { NotificationBanner } from "@/components/notifications/notification-banner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import type { Station } from "@shared/schema";

export default function Home() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: stations = [], isLoading, refetch } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
  });

  const { data: priceStats } = useQuery<{
    minGazole: number | null;
    maxGazole: number | null;
    avgGazole: number | null;
  }>({
    queryKey: ["/api/stations/stats/prices"],
  });

  const { data: searchResults = [] } = useQuery<Station[]>({
    queryKey: ["/api/stations/search", searchQuery],
    enabled: searchQuery.trim().length > 0,
  });

  const selectedStation = selectedStationId 
    ? stations.find((s: Station) => s.id === selectedStationId)
    : null;

  // Filter stations based on search query and map bounds
  const getDisplayedStations = () => {
    let filteredStations = searchQuery.trim() ? searchResults : stations;
    
    // Further filter by map bounds if available
    if (mapBounds && filteredStations) {
      filteredStations = filteredStations.filter((station: Station) => {
        return (
          station.lat >= mapBounds.south &&
          station.lat <= mapBounds.north &&
          station.lon >= mapBounds.west &&
          station.lon <= mapBounds.east
        );
      });
    }
    
    return filteredStations;
  };

  const displayedStations = getDisplayedStations();
  const visibleStations = mapBounds ? displayedStations : stations;

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Stations mises à jour",
        description: "Les données ont été actualisées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les données",
        variant: "destructive",
      });
    }
  };

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error);
          // Continue without location
        }
      );
    }
  }, []);

  // Check for low prices and show notification
  useEffect(() => {
    if (stations.length > 0) {
      const lowPriceStations = stations.filter((station) => 
        station.prixGazole && station.prixGazole < 1.65
      );
      if (lowPriceStations.length > 0 && showNotification) {
        // Notification will be shown by NotificationBanner component
      }
    }
  }, [stations, showNotification]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Notification Banner */}
      {showNotification && stations.some((station) => station.prixGazole && station.prixGazole < 1.65) && (
        <NotificationBanner
          onClose={() => setShowNotification(false)}
          stations={stations.filter((station) => station.prixGazole && station.prixGazole < 1.65)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h1 className="text-lg font-medium text-gray-900">Carburant Pas Cher</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 relative z-30">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          isLoading={isLoading}
        />
        
        {/* Price Summary */}
        <div className="flex items-center justify-between text-sm mt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-success">↓</span>
              <span className="text-gray-600">Min gazole:</span>
              <span className="font-medium text-success">
                {priceStats?.minGazole ? `${priceStats.minGazole} €/L` : "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-error">↑</span>
              <span className="text-gray-600">Max gazole:</span>
              <span className="font-medium text-error">
                {priceStats?.maxGazole ? `${priceStats.maxGazole} €/L` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative pb-20">
        <MapContainer
          stations={stations}
          onStationClick={setSelectedStationId}
          selectedStationId={selectedStationId}
          isLoading={isLoading}
          isFavorite={isFavorite}
        />
      </div>

      {/* Floating Refresh Button */}
      <Button
        onClick={handleRefresh}
        className="fixed bottom-6 right-6 rounded-full p-4 h-14 w-14 shadow-lg hover:shadow-xl z-30"
        disabled={isLoading}
      >
        <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      {/* Station List Panel */}
      <StationListPanel
        stations={stations}
        onStationClick={setSelectedStationId}
        userLocation={userLocation}
        isFavorite={isFavorite}
      />

      {/* Station Details Bottom Sheet */}
      {selectedStation && (
        <StationDetails
          station={selectedStation}
          onClose={() => setSelectedStationId(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(selectedStation.id)}
        />
      )}
    </div>
  );
}
