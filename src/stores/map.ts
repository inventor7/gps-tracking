import { defineStore } from "pinia";
import { ref } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { useEnv } from "@/composables/useEnv";
import { performanceTracker } from "@/utils/performance";
import { createMarkerAnimation } from "@/utils/markerAnimation";
import { markerPathVisualizer } from "@/utils/markerPathVisualizer";
import type { MapState, MarkerOptions, MarkerData } from "@/types/map";
import { useRealTimeMarkers } from "./useRealTimeMarkersStore";
import type { Actor, Position } from "@/types/actor";

// Create marker animator instance
const markerAnimator = createMarkerAnimation({
  duration: 300, // 300ms animation duration
  onStep: () =>
    performanceTracker.measure("marker-animation-frame", () =>
      Promise.resolve()
    ),
});

export const useMapStore = defineStore("map", () => {
  // State
  const map = ref<google.maps.Map | null>(null);
  const mapContainer = ref<HTMLElement | null>(null);
  const markers = ref<Record<string, google.maps.marker.AdvancedMarkerElement>>(
    {}
  );
  const isLoaded = ref(false);

  // Actions
  const initializeMap = async (container: HTMLElement) => {
    const env = useEnv();

    const apiKey = env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is missing");
    }

    const defaultCenter = {
      lat: Number(env.MAP_DEFAULT_CENTER_LAT) || 0,
      lng: Number(env.MAP_DEFAULT_CENTER_LNG) || 0,
    };

    const defaultZoom = Number(env.MAP_DEFAULT_ZOOM) || 12;

    const loader = new Loader({
      apiKey,
      version: "weekly",
    });

    try {
      const { Map } = await loader.importLibrary("maps");

      map.value = new Map(container, {
        center: defaultCenter,
        zoom: defaultZoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Enable advanced markers

      isLoaded.value = true;
    } catch (error) {
      throw error;
    }
  };

  const destroyMap = () => {
    // Clear all markers and their animations
    Object.entries(markers.value).forEach(([id, marker]) => {
      markerAnimator.cancelAnimation(id);
      marker.map = null;
    });

    // Clear path visualizer

    markers.value = {};
    map.value = null;
    isLoaded.value = false;
  };

  const addMarker = (
    id: string,
    position: google.maps.LatLngLiteral,
    element?: HTMLElement
  ) => {
    if (!map.value || !isLoaded.value) {
      return null;
    }

    // Remove existing marker if it exists
    removeMarker(id);

    try {
      const options: google.maps.marker.AdvancedMarkerElementOptions = {
        map: map.value,
        position,
        title: id,
      };

      if (element) {
        options.content = element;
      }

      const marker = new google.maps.marker.AdvancedMarkerElement(options);

      // Add marker to the map
      console.log("Adding marker", { id, marker });

      markers.value[id] = marker;

      return marker;
    } catch (error) {
      return null;
    }
  };

  const removeMarker = (id: string) => {
    performanceTracker.measure(
      "marker-removal",
      async () => {
        const marker = markers.value[id];
        if (marker) {
          // Cancel any ongoing animation
          markerAnimator.cancelAnimation(id);
          marker.map = null;
          delete markers.value[id];
        }
      },
      { markerId: id }
    );
  };

  const updateMarkerPosition = async (actor: Actor, position: Position) => {
    const marker = markers.value[`actor-${actor.id}`];
    const realTimeMarkers = useRealTimeMarkers();

    if (!marker) {
      if (position) {
        // Note: This needs to be fixed as 'actor' is not defined
        await realTimeMarkers.createActorMarker(actor, position);
        return;
      }
    }

    try {
      // Animate marker to new position
      await markerAnimator.animate(`actor-${actor.id}`, marker, {
        lat: position.latitude,
        lng: position.longitude,
      });
    } catch (error) {
      // Fallback to instant update
      marker.position = { lat: position.latitude, lng: position.longitude };
    }
  };

  const panTo = (position: google.maps.LatLngLiteral) => {
    performanceTracker.measure(
      "map-pan",
      async () => {
        if (map.value) {
          map.value.panTo(position);
        }
      },
      { position }
    );
  };

  const fitBounds = (bounds: google.maps.LatLngBoundsLiteral) => {
    performanceTracker.measure(
      "map-fit-bounds",
      async () => {
        if (!map.value) {
          return;
        }

        const googleBounds = new google.maps.LatLngBounds(bounds);
        map.value.fitBounds(googleBounds);
      },
      { bounds }
    );
  };

  const setZoom = (zoom: number) => {
    performanceTracker.measure(
      "map-zoom",
      async () => {
        if (map.value) {
          map.value.setZoom(zoom);
        }
      },
      { zoom }
    );
  };
  return {
    // State
    map,
    mapContainer,
    markers,
    isLoaded,
    // Actions
    initializeMap,
    destroyMap,
    addMarker,
    removeMarker,
    updateMarkerPosition,
    panTo,
    fitBounds,
    setZoom,
  };
});
