import type { Actor, LatLng, Position } from "@/types/actor";
import { useActorsStore } from "./actors";
import { useMapStore } from "./map";

export const useRealTimeMarkers = defineStore("real-time-markers", () => {
  const actorsStore = useActorsStore();
  const mapStore = useMapStore();

  // State
  const { selectedActor } = storeToRefs(actorsStore);
  const markersCreated = ref<Set<number>>(new Set());

  // Actions
  const createActorMarker = async (actor: Actor, position: Position) => {
    if (!mapStore.map) {
      console.warn("Map not initialized");
      return null;
    }

    if (!position) {
      console.warn(`No position data for actor ${actor.id}`);
      return null;
    }

    try {
      // Check if marker already exists
      if (markersCreated.value.has(actor.id)) {
        // Just update position if marker exists
        return mapStore.updateMarkerPosition(actor, position);
      }

      // Add marker to map
      const marker = mapStore.addMarker(`actor-${actor.id}`, {
        lat: position.latitude,
        lng: position.longitude,
      });

      // Track that this marker has been created
      markersCreated.value.add(actor.id);

      return marker;
    } catch (error) {
      console.error("Error creating actor marker:", {
        actorId: actor.id,
        error,
      });
      return null;
    }
  };

  const removeActorMarker = (actorId: number) => {
    try {
      markersCreated.value.delete(actorId);
      mapStore.removeMarker(`actor-${actorId}`);
    } catch (error) {
      console.error("Error removing actor marker:", {
        actorId,
        error,
      });
    }
  };

  return {
    // State
    markersCreated,
    // Actions
    createActorMarker,
    removeActorMarker,
  };
});
