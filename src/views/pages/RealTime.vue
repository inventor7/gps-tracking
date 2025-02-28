<template>
  <div class="h-full w-full relative">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>
    <!-- Actor Details Panel -->
    <RealTimeActorPanel
      :selected-actor="selectedActor"
      @close:actor="handleCloseActorPanle"
    />

    <!-- Debug Panels (Development Only) -->
    <!-- <template v-if="isDevelopment && debugConfig.isEnabled"> -->
    <template v-if="false">
      <MapDebugPanel />
      <!-- v-if="debugConfig.visualizations.paths" -->
      <AnimationDebugPanel />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useMapStore } from "@/stores/map";
import { useActorsStore } from "@/stores/actors";
import { useEnv } from "@/composables/useEnv";
import MapDebugPanel from "@/components/debug/MapDebugPanel.vue";
import AnimationDebugPanel from "@/components/debug/AnimationDebugPanel.vue";
import type { Actor } from "@/types/actor";
import RealTimeActorPanel from "@/views/pages/RealTime/RealTimeActorPanel.vue";
import { useRealTimeMarkers } from "@/stores/useRealTimeMarkersStore";
import { storeToRefs } from "pinia";

const env = useEnv();
// const logger = createLogger("RealTime");
// const isDevelopment = import.meta.env.DEV;

//stores
const mapStore = useMapStore();
const actorsStore = useActorsStore();
const realTimeMarkers = useRealTimeMarkers();

const { mapContainer } = storeToRefs(mapStore);
const { markersCreated } = storeToRefs(realTimeMarkers);
const { actors, actorPositions, selectedActor } = storeToRefs(actorsStore);

onMounted(async () => {
  if (!mapContainer.value) {
    return;
  }

  await mapStore.initializeMap(mapContainer.value);

  // First fetch actors
  await actorsStore.fetchActors();

  // Then fetch initial positions
  if (actors.value.length > 0) {
    await actorsStore.fetchActorPositions({
      ids: actors.value.map((actor) => actor.id),
      date_from: null,
      date_to: null,
    });
  }

  // Create markers for all actors with their initial positions
  await Promise.all(actors.value.map((actor) => createActorMarkerBatch(actor)));

  // Start real-time updates
  actorsStore.startPositionUpdates(Number(env.UPDATE_INTERVAL));
});

const createActorMarkerBatch = async (actor: Actor): Promise<void> => {
  const position = actorsStore.getCurrentPosition(actor.id);
  if (position) {
    await realTimeMarkers.createActorMarker(actor, position);
  }
};

// Add a new handler for actor selection
const handleActorSelect = async (actor: Actor) => {
  // Ensure marker exists before selecting
  const position = actorsStore.getCurrentPosition(actor.id);
  if (position && !markersCreated.value.has(actor.id)) {
    await realTimeMarkers.createActorMarker(actor, position);
  }
  await actorsStore.selectActor(actor);
};

const handleCloseActorPanle = async () => {
  await actorsStore.selectActor(undefined);
};

// Watch for changes in positions and update markers
watch(
  actorPositions,
  async (newPositions) => {
    await Promise.all(
      Object.entries(newPositions).map(([actorId, positions]) => {
        const lastPosition = positions[positions.length - 1];
        if (lastPosition) {
          // Find the actor by ID
          const actor = actors.value.find((a) => a.id === Number(actorId));
          if (actor) {
            return realTimeMarkers.createActorMarker(actor, lastPosition);
          }
        }
        return Promise.resolve();
      })
    );
  },
  { deep: true }
);

onUnmounted(() => {
  // Cleanup any remaining markers
  markersCreated.value.forEach((actorId) => {
    realTimeMarkers.removeActorMarker(actorId);
  });
  markersCreated.value.clear();

  actorsStore.stopPositionUpdates();
  mapStore.destroyMap();
});
</script>
