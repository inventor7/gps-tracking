<template>
  <SidebarGroup class="px-0">
    <SidebarGroupContent>
      <a
        v-for="actor in filteredActors"
        :key="actor.id"
        href="#"
        class="flex flex-col items-start gap-1 whitespace-nowrap border-b p-3 text-sm leading-tight last:border-b-0 hover:bg-primary/5 hover:text-sidebar-accent-foreground"
        @click="handleActorWidgetClick(actor)"
      >
        <div class="flex flex-row w-full justify-between gap-2">
          <span>{{ actor.name }}</span>
          <Badge variant="outline" class="text-xs">#{{ actor.id }}</Badge>
        </div>
        <span class="font-medium">{{
          actor.workflow_type ?? "SuperVisor"
        }}</span>
        <span class="line-clamp-2 text-xs">
          {{ actor.color }}
        </span>
      </a>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
<script setup lang="ts">
import { useActorsStore } from "@/stores/actors";
import { useRealTimeMarkers } from "@/stores/useRealTimeMarkersStore";
import type { Actor } from "@/types/actor";

const actorsStore = useActorsStore();
const realTimeMarkers = useRealTimeMarkers();
const { actorRealTimePosition, filteredActors } = storeToRefs(actorsStore);
const { markersCreated } = storeToRefs(realTimeMarkers);

const handleActorWidgetClick = async (actor: Actor) => {
  const position = actorRealTimePosition.value[actor.id];
  if (position && !markersCreated.value.has(actor.id)) {
    await realTimeMarkers.createActorMarker(actor, position);
  }
  await actorsStore.selectActor(actor);
};
</script>
