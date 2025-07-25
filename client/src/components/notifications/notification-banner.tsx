import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, MapPin } from "lucide-react";
import type { Station } from "@shared/schema";

interface NotificationBannerProps {
  onClose: () => void;
  stations: Station[];
}

export function NotificationBanner({ onClose, stations }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!stations.length) return null;

  const lowestPriceStation = stations.reduce((lowest, station) => {
    if (!station.prixGazole) return lowest;
    return !lowest.prixGazole || station.prixGazole < lowest.prixGazole ? station : lowest;
  }, stations[0]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 bg-success text-white px-4 py-3 z-50 shadow-lg transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Prix bas détecté !</span>
          <span className="text-sm">
            Gazole à {lowestPriceStation.prixGazole?.toFixed(3)} €/L chez {lowestPriceStation.nom}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-white hover:bg-opacity-20 p-1"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
