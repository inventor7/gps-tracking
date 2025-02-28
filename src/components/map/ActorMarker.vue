<template>
  <div
    class="actor-marker"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110"
      :style="{
        backgroundColor: backgroundColor,
        border: '2px solid white',
      }"
      :class="{
        'ring-2 ring-primary ring-offset-2': selected,
        'scale-110': isHovered,
      }"
    >
      <component :is="getWorkflowIcon" class="h-4 w-4 text-white" />
    </div>
    <div
      v-if="selected || isHovered"
      class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-2 whitespace-nowrap z-10"
    >
      <div class="text-xs font-medium">{{ actor.name }}</div>
      <div class="text-xs text-gray-500">
        {{ getCurrentSpeed }}km/h · {{ getCurrentBattery }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { Truck, ShoppingCart, User } from "lucide-vue-next";
import { useActorsStore } from "@/stores/actors";
import { useMapStore } from "@/stores/map";
import type { Actor } from "@/types/actor";

interface Props {
  actor: Actor;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
});

const emit = defineEmits<{
  (e: "select"): void;
  (e: "hover", isHovered: boolean): void;
}>();

const actorsStore = useActorsStore();
const mapStore = useMapStore();
const { getActorPosition } = storeToRefs(actorsStore);
const isHovered = ref(false);

const getWorkflowIcon = computed(() => {
  switch (props.actor.workflow_type?.toLowerCase()) {
    case "delivery":
      return Truck;
    case "vansale":
      return ShoppingCart;
    default:
      return User;
  }
});

const backgroundColor = computed(() => {
  return props.actor.color || "#4CAF50";
});

const getCurrentSpeed = computed(() => {
  const position = getActorPosition.value(props.actor.id);
  return position?.speed ?? 0;
});

const getCurrentBattery = computed(() => {
  const position = getActorPosition.value(props.actor.id);
  return position?.battery ?? 0;
});

const handleMouseEnter = () => {
  isHovered.value = true;
  emit("hover", true);
};

const handleMouseLeave = () => {
  isHovered.value = false;
  emit("hover", false);
};

const handleClick = () => {
  emit("select");

  // Pan to actor position
  const position = getActorPosition.value(props.actor.id);
  if (position) {
    mapStore.panTo({
      lat: position.latitude,
      lng: position.longitude,
    });
    mapStore.setZoom(15);
  }
};
</script>

<style scoped>
.actor-marker {
  position: relative;
  transform: translate(-50%, -50%);
  cursor: pointer;
  will-change: transform;
}

.actor-marker:hover {
  z-index: 1;
}

/* Tooltip animation */
.actor-marker div[class*="absolute"] {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 8px);
  }
}
</style>
