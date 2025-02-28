import { createLogger } from "./logger";
import { markerPathVisualizer } from "./markerPathVisualizer";
import type { MapState } from "@/types/map";
import type {
  MapHealth,
  MarkerStatus,
  DebugStats,
  PathDebugInfo,
  VisualizationState,
} from "@/types/debug";

const logger = createLogger("MapDebugger");

export function checkMapHealth(mapState: MapState): MapHealth {
  const issues: string[] = [];

  if (!mapState.map) {
    issues.push("Map instance not initialized");
  }

  if (!mapState.isLoaded) {
    issues.push("Map not marked as loaded");
  }

  const markerCount = Object.keys(mapState.markers).length;
  const invisibleMarkers = Object.values(mapState.markers).filter(
    (m) => !m.map
  ).length;
  const pathLengths = markerPathVisualizer.getPathLengths();
  const pathsVisualized = Object.values(pathLengths).filter(
    (length) => length > 0
  ).length;

  if (markerCount === 0) {
    issues.push("No markers present on map");
  }

  if (invisibleMarkers > 0) {
    issues.push(`${invisibleMarkers} markers are invisible`);
  }

  if (mapState.debugMode && pathsVisualized === 0 && markerCount > 0) {
    issues.push("No marker paths are being visualized");
  }

  return {
    healthy: issues.length === 0,
    issues,
    stats: {
      totalMarkers: markerCount,
      visibleMarkers: markerCount - invisibleMarkers,
      invisibleMarkers,
      pathsVisualized,
    },
  };
}

export function debugMarkers(mapState: MapState): MarkerStatus[] {
  return Object.entries(mapState.markers).map(([id, marker]) => {
    const pathLength = markerPathVisualizer.getPathLength(id);
    return {
      id,
      visible: !!marker.map,
      hasPath: pathLength > 0,
      pathLength,
      lastUpdate: Date.now(),
    };
  });
}

export function getPathDebugInfo(markerId: string): PathDebugInfo | null {
  const pathLength = markerPathVisualizer.getPathLength(markerId);
  if (pathLength === 0) return null;

  const bounds = markerPathVisualizer.getPathBounds(markerId);
  if (!bounds) return null;

  return {
    markerId,
    pointCount: pathLength,
    totalDistance: markerPathVisualizer.getPathDistance(markerId) || 0,
    averageSpeed: markerPathVisualizer.getAverageSpeed(markerId) || 0,
    lastUpdate: Date.now(),
    bounds,
  };
}

export function getVisualizationState(): VisualizationState {
  const pathLengths = markerPathVisualizer.getPathLengths();
  const activePaths = Object.values(pathLengths).filter(
    (length) => length > 0
  ).length;
  const totalPoints = Object.values(pathLengths).reduce(
    (sum, length) => sum + length,
    0
  );
  const averagePathLength = activePaths > 0 ? totalPoints / activePaths : 0;

  const timeRange = markerPathVisualizer.getTimeRange();

  return {
    enabled: markerPathVisualizer.isVisible(),
    activePaths,
    totalPoints,
    averagePathLength,
    oldestPoint: timeRange?.oldest || 0,
    newestPoint: timeRange?.newest || 0,
  };
}

export function togglePathVisualization(mapState: MapState, enabled: boolean) {
  if (!mapState.map || !mapState.debugMode) return;

  if (enabled) {
    markerPathVisualizer.setMap(mapState.map);
    logger.debug("Path visualization enabled", {
      markerCount: Object.keys(mapState.markers).length,
    });
  } else {
    markerPathVisualizer.setMap(null);
    logger.debug("Path visualization disabled");
  }
}

export function clearAllPaths() {
  const state = getVisualizationState();
  markerPathVisualizer.clearAllPaths();
  logger.debug("All path visualizations cleared", {
    clearedPaths: state.activePaths,
    totalPointsCleared: state.totalPoints,
  });
}

export function getDebugStats(mapState: MapState): DebugStats {
  const health = checkMapHealth(mapState);
  const markers = debugMarkers(mapState);
  const visualizationState = getVisualizationState();

  return {
    health,
    markers,
    pathVisualization: {
      enabled: visualizationState.enabled,
      totalPaths: visualizationState.activePaths,
      averagePathLength: visualizationState.averagePathLength,
    },
  };
}

export function logMarkerDebugInfo(markerId: string) {
  const pathInfo = getPathDebugInfo(markerId);
  if (pathInfo) {
    logger.debug("Marker path details:", {
      markerId,
      points: pathInfo.pointCount,
      distance: `${(pathInfo.totalDistance / 1000).toFixed(2)}km`,
      speed: `${pathInfo.averageSpeed.toFixed(1)}km/h`,
      bounds: pathInfo.bounds,
    });
  } else {
    logger.debug("No path data for marker:", { markerId });
  }
}
