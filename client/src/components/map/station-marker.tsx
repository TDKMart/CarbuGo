import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Station } from "@shared/schema";

interface StationMarkerProps {
  station: Station;
  onClick: () => void;
  isSelected?: boolean;
  isFavorite?: boolean;
}

export function StationMarker({ station, onClick, isSelected = false, isFavorite = false }: StationMarkerProps) {
  const getPriceColor = (price: number | null) => {
    if (!price) return "bg-gray-500";
    if (price < 1.65) return "bg-success";
    if (price > 1.80) return "bg-error";
    return "bg-warning";
  };

  const getBorderColor = (price: number | null) => {
    if (!price) return "border-gray-500";
    if (price < 1.65) return "border-success";
    if (price > 1.80) return "border-error";
    return "border-warning";
  };

  const priceColor = getPriceColor(station.prixGazole);
  const borderColor = getBorderColor(station.prixGazole);

  const markerIcon = divIcon({
    html: `
      <div class="flex flex-col items-center ${isSelected ? 'scale-110' : ''} transition-transform">
        <div class="${priceColor} shadow-lg rounded-lg px-2 py-1 text-white text-xs font-medium mb-1">
          ${station.prixGazole ? `${station.prixGazole} €` : 'N/A'}
        </div>
        <div class="relative bg-white ${borderColor} border-2 rounded-full p-2 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="${priceColor.replace('bg-', 'text-')}">
            <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3h1c.55 0 1 .45 1 1v3.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H4V8h8v2zm0-4H4V4h8v2z"/>
          </svg>
          ${isFavorite ? `
            <div class="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          ` : ''}
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [60, 80],
    iconAnchor: [30, 80],
  });

  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={markerIcon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-medium text-gray-900">{station.nom}</h3>
          <p className="text-sm text-gray-600">{station.adresse}</p>
          <p className="text-sm text-gray-600">{station.ville}</p>
          {station.prixGazole && (
            <p className="text-lg font-bold mt-2">
              Gazole: {station.prixGazole} €/L
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
