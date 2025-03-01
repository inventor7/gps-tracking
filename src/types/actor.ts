export interface Actor {
  id: number;
  name: string;
  icon: string;
  color: string;
  workflow_type: string;
  battery: number;
  speed: number;
  routeProgress: number;
}

export interface Position {
  ruid: string;
  latitude: number;
  longitude: number;
  battery: number;
  speed: number;
  course: number;
  times: Date;
}

export interface ActorFilter {
  hint: "text" | "bool" | "selection";
  label: string;
  name: string;
  values: null | ActorFilterValue[];
}

export interface ActorFilterValue {
  id: number | string;
  label: string;
}

export interface ActorInfo {
  id: number;
  name: string;
  image_1920: string;
  latitude: number;
  longitude: number;
  speed: number;
  battery: number;
  stats: ActorStats[];
}

export interface ActorStats {
  label: string;
  value: string;
}

export interface QueryParams {
  res_users_ids: number[] | null;
  date_from: Date | null;
  date_to: Date | null;
}

//history
export type ActorsHPositions = Record<number, Position[]>;
export interface ActorsHPositionParams {
  ids: number[];
  date_from: Date | null;
  date_to: Date | null;
}

//realTime
export type ActorsRTosition = Record<number, Position>;
export interface ActorsRTPositionParams {
  ids: number[];
}

// Routing types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Route {
  legs: RouteLeg[];
  overview_polyline: {
    points: string;
  };
  bounds: {
    northeast: LatLng;
    southwest: LatLng;
  };
  copyrights: string;
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface RouteLeg {
  steps: RouteStep[];
  distance: RouteDistance;
  duration: RouteDuration;
  start_address: string;
  end_address: string;
  start_location: LatLng;
  end_location: LatLng;
}

export interface RouteStep {
  travel_mode: string;
  start_location: LatLng;
  end_location: LatLng;
  polyline: {
    points: string;
  };
  duration: RouteDuration;
  distance: RouteDistance;
  html_instructions: string;
}

export interface RouteDistance {
  value: number;
  text: string;
}

export interface RouteDuration {
  value: number;
  text: string;
}

export interface RoutePolyline {
  polylines: string;
  options: {
    path: LatLng[];
    geodesic: boolean;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
    icons: RoutePolylineIcon[];
  };
}

export interface RoutePolylineIcon {
  icon: {
    path: string;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
  };
  offset: string;
  repeat: string;
}

export interface RouteingPolyline {
  actor_id: number;
  polylines: RoutePolyline[][];
}
