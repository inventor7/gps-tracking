import { createLogger } from "./logger";
import { performanceTracker } from "./performance";
import { markerAnimationTracker } from "./markerAnimationTracker";
import { useEnv } from "@/composables/useEnv";

export type AnimationEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";
interface AnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
  onStep?: (position: google.maps.LatLngLiteral) => void;
  onComplete?: () => void;
}

interface AnimationContext {
  markerId: string;
  startPosition: google.maps.LatLngLiteral;
  targetPosition: google.maps.LatLngLiteral;
  marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  onStep?: (position: google.maps.LatLngLiteral) => void;
  onComplete?: () => void;
}

export const getEasingFunction = (
  type: AnimationEasing
): ((t: number) => number) => {
  switch (type) {
    case "linear":
      return (t) => t;
    case "easeIn":
      return (t) => t * t;
    case "easeOut":
      return (t) => t * (2 - t);
    case "easeInOut":
      return (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    default:
      return defaultEasing;
  }
};

const defaultEasing = (t: number): number => {
  // Smooth easing function (ease-in-out)
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export function interpolatePosition(
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral,
  progress: number
): google.maps.LatLngLiteral {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}

function getMarkerLatLng(
  marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker
): google.maps.LatLngLiteral {
  if (marker instanceof google.maps.Marker) {
    const position = marker.getPosition();
    if (!position) return { lat: 0, lng: 0 };
    return { lat: position.lat(), lng: position.lng() };
  }

  const position = marker.position;

  if (!position) return { lat: 0, lng: 0 };

  if (typeof position.lat === "function" && typeof position.lng === "function")
    return { lat: position.lat(), lng: position.lng() };
  else if (typeof position.lat === "number" && typeof position.lng === "number")
    return { lat: position.lat, lng: position.lng };

  return { lat: 0, lng: 0 };
}

async function runAnimation(context: AnimationContext): Promise<void> {
  const {
    markerId,
    startPosition,
    targetPosition,
    marker,
    startTime,
    duration,
    easing,
    onStep,
    onComplete,
  } = context;

  return new Promise<void>((resolve) => {
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const currentPosition = interpolatePosition(
        startPosition,
        targetPosition,
        easedProgress
      );

      // Update marker position
      if (marker instanceof google.maps.Marker) {
        marker.setPosition(currentPosition);
      } else {
        marker.position = currentPosition;
      }

      // Update animation tracking
      markerAnimationTracker.updateProgress(
        markerId,
        progress,
        currentPosition
      );

      // Call step callback if provided
      onStep?.(currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        markerAnimationTracker.completeAnimation(markerId);
        onComplete?.();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

export async function animateMarkerPosition(
  markerId: string,
  marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker,
  targetPosition: google.maps.LatLngLiteral,
  options: AnimationOptions = {}
): Promise<void> {
  const startPosition = getMarkerLatLng(marker);
  const startTime = performance.now();

  // Start tracking this animation
  markerAnimationTracker.trackAnimation(
    markerId,
    startPosition,
    targetPosition,
    options.duration || 300
  );

  // Run the animation
  await runAnimation({
    markerId,
    startPosition,
    targetPosition,
    marker,
    startTime,
    duration: options.duration || 300,
    easing: options.easing || defaultEasing,
    onStep: options.onStep,
    onComplete: options.onComplete,
  });

  return;
}

interface MarkerAnimator {
  animate: (
    markerId: string,
    marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker,
    targetPosition: google.maps.LatLngLiteral
  ) => Promise<void>;
  cancelAnimation: (markerId: string) => void;
  getAnimationCount: () => number;
}

export function createMarkerAnimation(
  options: AnimationOptions = {}
): MarkerAnimator {
  const animations = new Map<string, number>();

  function cancelAnimation(markerId: string) {
    const animationId = animations.get(markerId);
    if (animationId) {
      cancelAnimationFrame(animationId);
      animations.delete(markerId);
      markerAnimationTracker.cancelAnimation(markerId);
    }
  }

  const animate = async (
    markerId: string,
    marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker,
    targetPosition: google.maps.LatLngLiteral
  ) => {
    cancelAnimation(markerId);

    try {
      await animateMarkerPosition(markerId, marker, targetPosition, options);
    } catch (error) {
      console.log(error);
      markerAnimationTracker.cancelAnimation(markerId);
    }
  };

  return {
    animate,
    cancelAnimation,
    getAnimationCount: () => animations.size,
  };
}
