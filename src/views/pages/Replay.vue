<template>
  <div class="h-full w-full relative">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full">
      <!-- Map will be mounted here -->
    </div>

    <!-- Replay Controls -->
    <div
      class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-10"
    >
      <div class="space-y-4 w-96">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Replay Mode</h3>
          <div class="text-sm text-gray-600">{{ currentTime }}</div>
        </div>

        <!-- Playback Controls -->
        <div class="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" @click="jumpBack">
            <SkipBack class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" @click="togglePlay">
            <component :is="isPlaying ? Pause : Play" class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" @click="jumpForward">
            <SkipForward class="h-4 w-4" />
          </Button>
          <div class="flex items-center gap-2 ml-4">
            <span class="text-sm">Speed:</span>
            <select
              v-model="playbackSpeed"
              class="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
            </select>
          </div>
        </div>

        <!-- Timeline -->
        <div class="relative h-8">
          <input
            type="range"
            v-model="progress"
            class="w-full"
            min="0"
            max="100"
            step="0.1"
            @input="handleProgressChange"
          />
        </div>

        <!-- Actor Stats -->
        <div v-if="currentPosition" class="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-600">Speed</p>
            <p class="font-medium">{{ currentPosition.speed }} km/h</p>
          </div>
          <div>
            <p class="text-gray-600">Battery</p>
            <p class="font-medium">{{ currentPosition.battery }}%</p>
          </div>
          <div>
            <p class="text-gray-600">Course</p>
            <p class="font-medium">{{ currentPosition.course }}°</p>
          </div>
          <div>
            <p class="text-gray-600">Status</p>
            <p class="font-medium">{{ currentStatus }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-vue-next";
import { useMapStore } from "@/stores/map";
import { useActorsStore } from "@/stores/actors";
import type { Position } from "@/types/actor";

const route = useRoute();
const mapContainer = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const playbackSpeed = ref<string>("1");
const progress = ref(0);
const currentPosition = ref<Position | null>(null);
const currentTime = computed(() =>
  currentPosition.value ? formatTime(new Date(currentPosition.value.times)) : ""
);
const animationFrame = ref<number | null>(null);
const startTime = ref<number>(0);
const positions = ref<Position[]>([]);

const mapStore = useMapStore();
const actorsStore = useActorsStore();

const currentStatus = computed(() => {
  if (!currentPosition.value) return "N/A";
  return "Active"; // This should be determined based on your business logic
});

onMounted(async () => {
  if (!mapContainer.value) return;

  const actorId = Number(route.params.actorId);
  const date = new Date(route.query.date as string);

  await mapStore.initializeMap(mapContainer.value);

  // Fetch historical positions
  await actorsStore.fetchActorPositions({
    ids: [actorId],
    date_from: date,
    date_to: new Date(date.getTime() + 24 * 60 * 60 * 1000),
  });

  const actorPositions = actorsStore.actorPositions[actorId] || [];
  positions.value = [...actorPositions].sort(
    (a, b) => new Date(a.times).getTime() - new Date(b.times).getTime()
  );

  if (positions.value.length > 0) {
    currentPosition.value = positions.value[0];
    startTime.value = new Date(positions.value[0].times).getTime();
  }
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
  mapStore.destroyMap();
});

const formatTime = (date: Date) => {
  return date.toLocaleTimeString();
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startAnimation();
  } else if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
};

const startAnimation = () => {
  let lastTime = performance.now();

  const animate = (currentTime: number) => {
    if (!isPlaying.value) return;

    const deltaTime = (currentTime - lastTime) * Number(playbackSpeed.value);
    lastTime = currentTime;

    // Update progress based on deltaTime
    updateProgress(deltaTime);

    animationFrame.value = requestAnimationFrame(animate);
  };

  animationFrame.value = requestAnimationFrame(animate);
};

const updateProgress = (deltaTime: number) => {
  if (positions.value.length === 0) return;

  const totalDuration =
    new Date(positions.value[positions.value.length - 1].times).getTime() -
    startTime.value;
  const currentProgress = progress.value + (deltaTime / totalDuration) * 100;

  if (currentProgress >= 100) {
    progress.value = 100;
    isPlaying.value = false;
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value);
    }
  } else {
    progress.value = currentProgress;
  }

  updatePositionFromProgress();
};

const updatePositionFromProgress = () => {
  if (positions.value.length === 0) return;

  const totalDuration =
    new Date(positions.value[positions.value.length - 1].times).getTime() -
    startTime.value;
  const targetTime = startTime.value + (totalDuration * progress.value) / 100;

  // Find the closest position
  let closestPosition = positions.value[0];
  let minDiff = Math.abs(
    new Date(closestPosition.times).getTime() - targetTime
  );

  for (const position of positions.value) {
    const diff = Math.abs(new Date(position.times).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestPosition = position;
    }
  }

  currentPosition.value = closestPosition;
  mapStore.panTo({
    lat: closestPosition.latitude,
    lng: closestPosition.longitude,
  });
};

const handleProgressChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  progress.value = value;
  updatePositionFromProgress();
};

const jumpBack = () => {
  progress.value = Math.max(0, progress.value - 5);
  updatePositionFromProgress();
};

const jumpForward = () => {
  progress.value = Math.min(100, progress.value + 5);
  updatePositionFromProgress();
};

watch(playbackSpeed, () => {
  if (isPlaying.value) {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value);
    }
    startAnimation();
  }
});
</script>

<style scoped>
input[type="range"] {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 2px solid #2563eb;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 2px solid #2563eb;
  border-radius: 50%;
  cursor: pointer;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
