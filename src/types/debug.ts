export interface MapHealth {
  healthy: boolean;
  issues: string[];
  stats: {
    totalMarkers: number;
    visibleMarkers: number;
    invisibleMarkers: number;
    pathsVisualized: number;
  };
}

export interface MarkerStatus {
  id: string;
  visible: boolean;
  hasPath: boolean;
  pathLength: number;
  lastUpdate: number;
}

export interface PathVisualization {
  enabled: boolean;
  totalPaths: number;
  averagePathLength: number;
}

export interface DebugStats {
  health: MapHealth;
  markers: MarkerStatus[];
  pathVisualization: PathVisualization;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AnimationDebugInfo {
  id: string;
  startTime: number;
  duration: number;
  progress: number;
  fps: number;
  frameCount: number;
  startPosition: google.maps.LatLngLiteral;
  currentPosition: google.maps.LatLngLiteral;
  targetPosition: google.maps.LatLngLiteral;
}

export interface PathDebugInfo {
  markerId: string;
  pointCount: number;
  totalDistance: number;
  averageSpeed: number;
  lastUpdate: number;
  bounds: google.maps.LatLngBoundsLiteral;
}

export interface VisualizationState {
  enabled: boolean;
  activePaths: number;
  totalPoints: number;
  averagePathLength: number;
  oldestPoint: number;
  newestPoint: number;
}
