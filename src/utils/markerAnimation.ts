import { createLogger } from "./logger";
import { performanceTracker } from "./performance";
import { markerAnimationTracker } from "./markerAnimationTracker";

const logger = createLogger("MarkerAnimation");

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
  marker: google.maps.marker.AdvancedMarkerElement;
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  onStep?: (position: google.maps.LatLngLiteral) => void;
  onComplete?: () => void;
}

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
  marker: google.maps.marker.AdvancedMarkerElement
): google.maps.LatLngLiteral {
  const position = marker.position as google.maps.LatLng;
  return {
    lat: position.lat(),
    lng: position.lng(),
  };
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
      marker.position = currentPosition;

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
  marker: google.maps.marker.AdvancedMarkerElement,
  targetPosition: google.maps.LatLngLiteral,
  options: AnimationOptions = {}
): Promise<void> {
  return performanceTracker.measure(
    "marker-animation",
    async () => {
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
    },
    {
      markerId,
      from: getMarkerLatLng(marker),
      to: targetPosition,
      duration: options.duration,
    }
  );
}

interface MarkerAnimator {
  animate: (
    markerId: string,
    marker: google.maps.marker.AdvancedMarkerElement,
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

  async function animate(
    markerId: string,
    marker: google.maps.marker.AdvancedMarkerElement,
    targetPosition: google.maps.LatLngLiteral
  ) {
    // Cancel any existing animation for this marker
    cancelAnimation(markerId);

    try {
      await animateMarkerPosition(markerId, marker, targetPosition, options);
    } catch (error) {
      logger.error("Animation error:", { markerId, error });
      markerAnimationTracker.cancelAnimation(markerId);
      // Fallback to instant position update
      marker.position = targetPosition;
    }
  }

  return {
    animate,
    cancelAnimation,
    getAnimationCount: () => animations.size,
  };
}
