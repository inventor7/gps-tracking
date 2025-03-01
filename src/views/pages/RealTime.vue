<template>
  <div class="h-full w-full relative">
    <!-- Map Container -->
    <div id="map" ref="mapContainer" class="w-full h-full"></div>
    <!-- Actor Details Panel -->
    <RealTimeActorPanel
      :selected-actor="selectedActor"
      @close:actor="handleCloseActorPanel"
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
import { useEnv } from "@/composables/useEnv";
import MapDebugPanel from "@/components/debug/MapDebugPanel.vue";
import AnimationDebugPanel from "@/components/debug/AnimationDebugPanel.vue";
import type { Actor } from "@/types/actor";
import RealTimeActorPanel from "@/views/pages/RealTime/RealTimeActorPanel.vue";
import { useRealTimeMarkers } from "@/stores/useRealTimeMarkersStore";
import { storeToRefs } from "pinia";
import { useRealTimeActorsStore } from "@/stores/useRealTimeActorsStore";

const env = useEnv();
// const logger = createLogger("RealTime");
// const isDevelopment = import.meta.env.DEV;

//stores
const mapStore = useMapStore();
const realTimeActorsStore = useRealTimeActorsStore();
const realTimeMarkers = useRealTimeMarkers();

const { mapContainer } = storeToRefs(mapStore);
const { markersCreated } = storeToRefs(realTimeMarkers);
const {
  actors,
  actorsRTPosition,
  selectedActor,
  selectedActors,
  selectedActorsIds,
} = storeToRefs(realTimeActorsStore);

onMounted(async () => {
  if (!mapContainer.value) {
    return;
  }

  await mapStore.initializeMap(mapContainer.value);

  await realTimeActorsStore.fetchActors();

  //init for all actors
  selectedActors.value = [actors.value[12]];

  await realTimeActorsStore.fetchRTActorsPosition({
    ids: selectedActorsIds.value,
  });

  await Promise.all(
    selectedActors.value.map((actor) => createActorMarkerBatch(actor))
  );

  await realTimeActorsStore.startPositionUpdates(Number(env.UPDATE_INTERVAL));
});

const createActorMarkerBatch = async (actor: Actor): Promise<void> => {
  const position = actorsRTPosition.value[actor.id];

  await realTimeMarkers.createActorMarker(actor, position);
};

const handleCloseActorPanel = async () => {
  await realTimeActorsStore.selectActor(undefined);
};

watch(
  actorsRTPosition,
  async (newPositions) => {
    await Promise.all(
      Object.entries(newPositions).map(async ([actorId, position]) => {
        const actor = actors.value.find((a) => a.id === Number(actorId));

        if (!actor) return;

        await mapStore.updateMarkerPosition(actor, position);
      })
    );
  },
  { deep: true }
);

onUnmounted(() => {
  markersCreated.value.forEach((actorId) => {
    realTimeMarkers.removeActorMarker(actorId);
  });
  markersCreated.value.clear();

  realTimeActorsStore.stopPositionUpdates();
  mapStore.destroyMap();
});
</script>
