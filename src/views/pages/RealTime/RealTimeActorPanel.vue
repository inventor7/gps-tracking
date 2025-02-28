<template>
  <div
    v-if="selectedActor"
    class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :style="{ backgroundColor: selectedActor.color }"
            :class="{ 'bg-primary': !selectedActor.color }"
          >
            <component
              :is="getWorkflowIcon(selectedActor)"
              class="h-6 w-6 text-white"
            />
          </div>
          <div>
            <h4 class="font-semibold">{{ selectedActor.name }}</h4>
            <p class="text-sm text-gray-600">
              {{ selectedActor.workflow_type }}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" @click="handleClosePanel">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-600">Speed</p>
          <p class="font-medium">
            {{ getCurrentSpeed(selectedActor.id) || 0 }} km/h
          </p>
        </div>
        <div>
          <p class="text-gray-600">Battery</p>
          <p class="font-medium">
            {{ getCurrentBattery(selectedActor.id) || 0 }}%
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-600">Current Route</p>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary"
            :style="{ width: `${selectedActor.routeProgress || 0}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useActorsStore } from "@/stores/actors";
import type { Actor } from "@/types/actor";
import { Truck, ShoppingCart, User, X } from "lucide-vue-next";

const emit = defineEmits(["close:actor"]);
const { selectedActor } = defineProps<{
  selectedActor: Actor | undefined;
}>();

const actorsStore = useActorsStore();
const { actors, actorPositions } = storeToRefs(actorsStore);

const getWorkflowIcon = (actor: Actor) => {
  switch (actor.workflow_type?.toLowerCase()) {
    case "delivery":
      return Truck;
    case "vansale":
      return ShoppingCart;
    default:
      return User;
  }
};

const getCurrentPosition = (actorId: number) => {
  const positions = actorPositions.value[actorId];
  if (!positions || positions.length === 0) return null;
  return positions[positions.length - 1];
};

const getCurrentSpeed = (actorId: number) => {
  return getCurrentPosition(actorId)?.speed ?? 0;
};

const getCurrentBattery = (actorId: number) => {
  return getCurrentPosition(actorId)?.battery ?? 0;
};

const handleClosePanel = () => {
  emit("close:actor", selectedActor);
};
</script>
