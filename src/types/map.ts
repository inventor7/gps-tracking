export interface MapState {
  map: google.maps.Map | null;
  markers: Record<string, google.maps.marker.AdvancedMarkerElement>;
  isLoaded: boolean;
  debugMode?: boolean;
}

export interface MarkerOptions {
  map?: google.maps.Map;
  position?: google.maps.LatLngLiteral;
  title?: string;
  content?: HTMLElement;
  collisionBehavior?: string;
  draggable?: boolean;
  clickable?: boolean;
  zIndex?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: google.maps.LatLngLiteral;
  zoom: number;
  bounds?: MapBounds;
}

export interface MarkerData {
  id: string;
  position: google.maps.LatLngLiteral;
  element?: HTMLElement;
  options?: Partial<MarkerOptions>;
}
