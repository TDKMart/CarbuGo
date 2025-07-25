import { useState, useCallback } from 'react';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useMapBounds() {
  const [bounds, setBounds] = useState<MapBounds>({
    north: 49.5,
    south: 41.3,
    east: 9.6,
    west: -5.2
  });
  
  const [zoom, setZoom] = useState(6);

  const updateBounds = useCallback((newBounds: MapBounds, newZoom: number) => {
    setBounds(newBounds);
    setZoom(newZoom);
  }, []);

  return {
    bounds,
    zoom,
    updateBounds
  };
}