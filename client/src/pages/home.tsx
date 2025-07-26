import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { OptimizedMapContainer } from "@/components/map/optimized-map-container";
import { OptimizedSearchBar } from "@/components/search/optimized-search-bar";
import { StationDetails } from "@/components/station/station-details";
import { StationListPanel } from "@/components/station/station-list-panel";
import { NotificationBanner } from "@/components/notifications/notification-banner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Menu, Settings } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useDebounce } from "@/hooks/use-debounce";
import type { Station } from "@shared/schema";

export default function Home() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(true);
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Use geolocation hook for better location handling
  const { latitude, longitude, error: locationError } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
  });

  const userLocation = latitude && longitude ? { lat: latitude, lon: longitude } : null;

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get all stations for the list panel and statistics
  const { data: allStations = [], isLoading: allStationsLoading, refetch } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: priceStats } = useQuery<{
    minGazole: number | null;
    maxGazole: number | null;
    avgGazole: number | null;
  }>({
    queryKey: ["/api/stations/stats/prices"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Station[]>({
    queryKey: ["/api/stations/search", debouncedSearchQuery],
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const selectedStation = selectedStationId 
    ? allStations.find((s: Station) => s.id === selectedStationId)
    : null;

  // Use search results if searching, otherwise use all stations
  const displayedStations = searchQuery.trim() ? searchResults : allStations;

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

  // Show location error if any
  useEffect(() => {
    if (locationError) {
      console.log("Erreur de géolocalisation:", locationError);
    }
  }, [locationError]);

  // Check for low prices and show notification
  useEffect(() => {
    if (allStations.length > 0) {
      const lowPriceStations = allStations.filter((station) => 
        station.prixGazole && station.prixGazole < 1.65
      );
      if (lowPriceStations.length > 0 && showNotification) {
        // Notification will be shown by NotificationBanner component
      }
    }
  }, [allStations, showNotification]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Notification Banner */}
      {showNotification && allStations.some((station) => station.prixGazole && station.prixGazole < 1.65) && (
        <NotificationBanner
          onClose={() => setShowNotification(false)}
          stations={allStations.filter((station) => station.prixGazole && station.prixGazole < 1.65)}
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
              <h1 className="text-lg font-medium text-gray-900">CarbuGo</h1>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 relative z-30">
        <OptimizedSearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          isLoading={searchLoading}
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
        <OptimizedMapContainer
          onStationClick={setSelectedStationId}
          selectedStationId={selectedStationId}
          isLoading={allStationsLoading}
          isFavorite={isFavorite}
        />
      </div>

      {/* Floating Refresh Button */}
      <Button
        onClick={handleRefresh}
        className="fixed bottom-6 right-6 rounded-full p-4 h-14 w-14 shadow-lg hover:shadow-xl z-30"
        disabled={allStationsLoading}
      >
        <RefreshCw className={`h-6 w-6 ${allStationsLoading ? 'animate-spin' : ''}`} />
      </Button>

      {/* Station List Panel */}
      <StationListPanel
        stations={displayedStations}
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
