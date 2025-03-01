import { defineStore } from "pinia";
import { ref } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { useEnv } from "@/composables/useEnv";
import { performanceTracker } from "@/utils/performance";
import {
  createMarkerAnimation,
  getEasingFunction,
} from "@/utils/markerAnimation";
import { markerPathVisualizer } from "@/utils/markerPathVisualizer";
import type { MapState, MarkerOptions, MarkerData } from "@/types/map";
import { useRealTimeMarkers } from "./useRealTimeMarkersStore";
import type { Actor, Position } from "@/types/actor";

// Create marker animator instance
const markerAnimator = createMarkerAnimation({
  duration: useEnv().MARKER_ANIMATION_DURATION,
  easing: getEasingFunction(useEnv().MARKER_ANIMATION_EASING),
});

export const useMapStore = defineStore("map", () => {
  // State
  const map = ref<google.maps.Map | null>(null);
  const mapContainer = ref<HTMLElement | null>(null);
  const markers = ref<Record<string, google.maps.marker.AdvancedMarkerElement>>(
    {}
  );

  const deprecatedMarkers = ref<Record<string, google.maps.Marker>>({});
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
      libraries: ["maps", "marker"],
    });

    try {
      const { Map } = await loader.importLibrary("maps");
      const { AdvancedMarkerElement, PinElement } = await loader.importLibrary(
        "marker"
      );

      map.value = new Map(container, {
        mapId: "DEMO_MAP_ID",
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: "greedy",
      });

      isLoaded.value = true;
    } catch (error) {
      console.error("Error initializing map:", error);
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
    id: number,
    position: google.maps.LatLngLiteral,
    element?: HTMLElement
  ) => {
    try {
      //Advanced Marker
      // const options: google.maps.marker.AdvancedMarkerElementOptions = {
      //   map: map.value,
      //   position,
      //   title: `actor-${id}`,
      // };

      // if (element) options.content = element;
      // else {
      //   const content = new google.maps.marker.PinElement({
      //     scale: 2,
      //   });
      //   options.content = content.element;
      // }
      //const marker = new google.maps.marker.AdvancedMarkerElement(options);
      // markers.value[`actor-${id}`] = marker;

      const marker = new google.maps.Marker({
        map: map.value,
        position,
        title: `actor-${id}`,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
        optimized: false,
      });

      deprecatedMarkers.value[`actor-${id}`] = marker;

      console.log("created marker", id);

      return marker;
    } catch (error) {
      return console.error("Error adding marker:", error);
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

  const minusMarker = ref(0);

  const updateMarkerPosition = async (actor: Actor, position: Position) => {
    const marker = markers.value[`actor-${actor.id}`];
    const deprecatedMarker = deprecatedMarkers.value[`actor-${actor.id}`];

    minusMarker.value = minusMarker.value + 0.001;

    await markerAnimator.animate(`actor-${actor.id}`, deprecatedMarker, {
      lat: position.latitude + minusMarker.value,
      lng: position.longitude + minusMarker.value,
    });

    if (!marker) return;

    try {
      console.log("Animate");
      await markerAnimator.animate(`actor-${actor.id}`, marker, {
        lat: position.latitude,
        lng: position.longitude,
      });
    } catch (error) {
      console.error(
        `Error updating marker position for actor-${actor.id}:`,
        error
      );

      marker.position = { lat: position.latitude, lng: position.longitude };
    }
  };

  const panTo = (position: google.maps.LatLngLiteral) => {
    if (map.value) {
      map.value.panTo(position);
    }
  };

  const fitBounds = (bounds: google.maps.LatLngBoundsLiteral) => {
    if (!map.value) {
      return;
    }

    const googleBounds = new google.maps.LatLngBounds(bounds);
    map.value.fitBounds(googleBounds);
  };

  const setZoom = (zoom: number) => {
    if (map.value) {
      map.value.setZoom(zoom);
    }
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
