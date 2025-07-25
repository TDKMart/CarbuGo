import { Button } from "@/components/ui/button";
import { X, Navigation, Star, MapPin } from "lucide-react";
import type { Station } from "@shared/schema";

interface StationDetailsProps {
  station: Station;
  onClose: () => void;
  onToggleFavorite?: (stationId: string) => void;
  isFavorite?: boolean;
}

export function StationDetails({ station, onClose, onToggleFavorite, isFavorite = false }: StationDetailsProps) {
  const formatPrice = (price: number | null) => {
    return price ? `${price.toFixed(3)} €/L` : "N/A";
  };

  const getPriceColorClass = (price: number | null) => {
    if (!price) return "text-gray-700";
    if (price < 1.65) return "text-success";
    if (price > 1.80) return "text-error";
    return "text-warning";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[1100] max-h-96 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="p-4">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        
        {/* Station Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{station.nom}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{station.adresse}</span>
            </div>
            <p className="text-sm text-gray-600">{station.ville}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Fuel Prices */}
        <div className="space-y-3 mb-4">
          {/* Gazole */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Gazole</p>
                <p className="text-xs text-gray-600">Diesel</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixGazole)}`}>
                {formatPrice(station.prixGazole)}
              </p>
            </div>
          </div>

          {/* SP95 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">SP95</p>
                <p className="text-xs text-gray-600">Sans plomb 95</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixSP95)}`}>
                {formatPrice(station.prixSP95)}
              </p>
            </div>
          </div>

          {/* SP98 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">SP98</p>
                <p className="text-xs text-gray-600">Sans plomb 98</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixSP98)}`}>
                {formatPrice(station.prixSP98)}
              </p>
            </div>
          </div>

          {/* E10 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">E10</p>
                <p className="text-xs text-gray-600">Essence E10</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixE10)}`}>
                {formatPrice(station.prixE10)}
              </p>
            </div>
          </div>

          {/* E85 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">E85</p>
                <p className="text-xs text-gray-600">Bioéthanol</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixE85)}`}>
                {formatPrice(station.prixE85)}
              </p>
            </div>
          </div>

          {/* GPL-c */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">GPL-c</p>
                <p className="text-xs text-gray-600">Gaz de pétrole liquéfié</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getPriceColorClass(station.prixGPLc)}`}>
                {formatPrice(station.prixGPLc)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mb-4">
          <Button 
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={() => {
              const destination = `${station.lat},${station.lon}`;
              const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodeURIComponent(station.nom)}`;
              window.open(url, '_blank');
            }}
          >
            <Navigation className="h-4 w-4" />
            <span>Itinéraire</span>
          </Button>
          {onToggleFavorite && (
            <Button 
              variant={isFavorite ? "default" : "outline"} 
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={() => onToggleFavorite(station.id)}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Favori' : 'Favoris'}</span>
            </Button>
          )}
        </div>

        {/* Last Update */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Dernière mise à jour: {formatDate(station.maj)}
          </p>
        </div>
      </div>
    </div>
  );
}
