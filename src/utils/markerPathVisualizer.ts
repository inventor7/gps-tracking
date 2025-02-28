import { createLogger } from "./logger";
import type { MarkerData } from "@/types/map";

const logger = createLogger("MarkerPathVisualizer");

interface PathOptions {
  maxPoints?: number;
  lineColor?: string;
  lineOpacity?: number;
  showArrows?: boolean;
  fadeOutDuration?: number;
}

interface PathPoint {
  position: google.maps.LatLngLiteral;
  timestamp: number;
}

interface TimeRange {
  oldest: number;
  newest: number;
}

class MarkerPathVisualizer {
  private paths = new Map<string, Array<PathPoint>>();
  private polylines = new Map<string, google.maps.Polyline>();
  private arrows = new Map<string, google.maps.Marker[]>();
  private map: google.maps.Map | null = null;
  private options: Required<PathOptions>;

  constructor(options: PathOptions = {}) {
    this.options = {
      maxPoints: options.maxPoints || 100,
      lineColor: options.lineColor || "#4CAF50",
      lineOpacity: options.lineOpacity || 0.6,
      showArrows: options.showArrows ?? true,
      fadeOutDuration: options.fadeOutDuration || 5000,
    };
  }

  setMap(map: google.maps.Map | null) {
    this.map = map;
    if (!map) {
      this.clearAllPaths();
    }
  }

  addPoint(markerId: string, position: google.maps.LatLngLiteral) {
    if (!this.map) return;

    // Get or create path array
    let path = this.paths.get(markerId) || [];

    // Add new point
    path.push({
      position,
      timestamp: Date.now(),
    });

    // Limit path length
    if (path.length > this.options.maxPoints) {
      path = path.slice(-this.options.maxPoints);
    }

    this.paths.set(markerId, path);
    this.updateVisualization(markerId);
  }

  getPathBounds(markerId: string): google.maps.LatLngBoundsLiteral | null {
    const path = this.paths.get(markerId);
    if (!path || path.length === 0) return null;

    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) =>
      bounds.extend(new google.maps.LatLng(point.position))
    );

    return {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
    };
  }

  getPathDistance(markerId: string): number {
    const path = this.paths.get(markerId);
    if (!path || path.length < 2) return 0;

    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      distance += google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(path[i - 1].position),
        new google.maps.LatLng(path[i].position)
      );
    }
    return distance;
  }

  getAverageSpeed(markerId: string): number {
    const path = this.paths.get(markerId);
    if (!path || path.length < 2) return 0;

    const distance = this.getPathDistance(markerId); // meters
    const timeSpan =
      (path[path.length - 1].timestamp - path[0].timestamp) / 1000; // seconds

    if (timeSpan === 0) return 0;
    return (distance / timeSpan) * 3.6; // Convert m/s to km/h
  }

  getTimeRange(): TimeRange | null {
    let oldest = Infinity;
    let newest = -Infinity;

    for (const path of this.paths.values()) {
      if (path.length > 0) {
        oldest = Math.min(oldest, path[0].timestamp);
        newest = Math.max(newest, path[path.length - 1].timestamp);
      }
    }

    if (oldest === Infinity || newest === -Infinity) {
      return null;
    }

    return { oldest, newest };
  }

  private updateVisualization(markerId: string) {
    const path = this.paths.get(markerId);
    if (!path || !this.map) return;

    // Update or create polyline
    let polyline = this.polylines.get(markerId);
    if (!polyline) {
      polyline = new google.maps.Polyline({
        map: this.map,
        path: path.map((p) => p.position),
        geodesic: true,
        strokeColor: this.options.lineColor,
        strokeOpacity: this.options.lineOpacity,
        strokeWeight: 2,
      });
      this.polylines.set(markerId, polyline);
    } else {
      polyline.setPath(path.map((p) => p.position));
    }

    // Update arrows if enabled
    if (this.options.showArrows) {
      this.updateArrows(markerId, path);
    }

    // Start fade out timer
    this.startFadeOut(markerId);
  }

  private updateArrows(markerId: string, path: PathPoint[]) {
    this.clearArrows(markerId);

    if (path.length < 2) return;

    const arrows: google.maps.Marker[] = [];

    for (let i = 1; i < path.length; i += Math.ceil(path.length / 5)) {
      const start = path[i - 1].position;
      const end = path[i].position;
      const heading = google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(start),
        new google.maps.LatLng(end)
      );

      const arrow = new google.maps.Marker({
        position: this.interpolatePosition(start, end, 0.5),
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          rotation: heading,
          fillColor: this.options.lineColor,
          fillOpacity: this.options.lineOpacity,
          strokeWeight: 1,
        },
      });

      arrows.push(arrow);
    }

    this.arrows.set(markerId, arrows);
  }

  private startFadeOut(markerId: string) {
    if (!this.options.fadeOutDuration) return;

    const path = this.paths.get(markerId);
    if (!path || path.length === 0) return;

    const lastUpdate = path[path.length - 1].timestamp;
    const timeoutId = setTimeout(() => {
      this.fadeOutPath(markerId, lastUpdate);
    }, this.options.fadeOutDuration);

    this.polylines.get(markerId)?.set("fadeTimeout", timeoutId);
  }

  private fadeOutPath(markerId: string, timestamp: number) {
    const path = this.paths.get(markerId);
    if (!path || path[path.length - 1].timestamp !== timestamp) return;

    const polyline = this.polylines.get(markerId);
    if (!polyline) return;

    let opacity = this.options.lineOpacity;
    const fadeInterval = setInterval(() => {
      opacity -= 0.05;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.removePath(markerId);
      } else {
        polyline.setOptions({ strokeOpacity: opacity });
        this.arrows.get(markerId)?.forEach((arrow) => {
          const icon = arrow.getIcon() as google.maps.Symbol;
          arrow.setIcon({
            ...icon,
            fillOpacity: opacity,
          });
        });
      }
    }, 50);
  }

  private interpolatePosition(
    start: google.maps.LatLngLiteral,
    end: google.maps.LatLngLiteral,
    fraction: number
  ): google.maps.LatLngLiteral {
    return {
      lat: start.lat + (end.lat - start.lat) * fraction,
      lng: start.lng + (end.lng - start.lng) * fraction,
    };
  }

  removePath(markerId: string) {
    const polyline = this.polylines.get(markerId);
    if (polyline) {
      const timeoutId = polyline.get("fadeTimeout");
      if (timeoutId) clearTimeout(timeoutId);
      polyline.setMap(null);
    }
    this.polylines.delete(markerId);
    this.clearArrows(markerId);
    this.paths.delete(markerId);
  }

  private clearArrows(markerId: string) {
    this.arrows.get(markerId)?.forEach((arrow) => arrow.setMap(null));
    this.arrows.delete(markerId);
  }

  clearAllPaths() {
    Array.from(this.paths.keys()).forEach((id) => this.removePath(id));
  }

  getPathLength(markerId: string): number {
    return this.paths.get(markerId)?.length ?? 0;
  }

  getPathLengths(): Record<string, number> {
    const lengths: Record<string, number> = {};
    for (const [id, path] of this.paths.entries()) {
      lengths[id] = path.length;
    }
    return lengths;
  }

  isVisible(): boolean {
    return !!this.map;
  }
}

// Create and export singleton instance
export const markerPathVisualizer = new MarkerPathVisualizer();
