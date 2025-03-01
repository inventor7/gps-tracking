import { defineStore } from "pinia";
import { ref } from "vue";
import type { Actor, Position } from "@/types/actor";
import { useMapStore } from "./map";

export const useRealTimeMarkers = defineStore("real-time-markers", () => {
  const mapStore = useMapStore();

  const markersCreated = ref<Set<number>>(new Set());

  const createActorMarker = async (actor: Actor, position: Position) => {
    try {
      const doesMarkerExist = markersCreated.value.has(actor.id);

      if (doesMarkerExist)
        return await mapStore.updateMarkerPosition(actor, position);

      const markerElement = document.createElement("div");
      markerElement.innerHTML = `
        <div style="
          background-color: #4285F4; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${actor.id}</div>
      `;

      const marker = mapStore.addMarker(
        actor.id,
        {
          lat: position.latitude,
          lng: position.longitude,
        },
        markerElement
      );

      if (marker) markersCreated.value.add(actor.id);

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
      console.log(`Removing marker for actor ${actorId}`);
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
    markersCreated,

    createActorMarker,
    removeActorMarker,
  };
});
