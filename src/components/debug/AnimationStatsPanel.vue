<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h4 class="text-sm font-semibold text-white/90">Animation Stats</h4>
      <div
        class="px-2 py-0.5 rounded text-xs"
        :class="activeAnimations.length ? 'bg-green-500/20' : 'bg-gray-500/20'"
      >
        {{ activeAnimations.length }} Active
      </div>
    </div>

    <!-- Global Stats -->
    <div v-if="performanceStats" class="grid grid-cols-2 gap-2">
      <div class="bg-white/10 rounded p-2">
        <div class="text-xs text-white/60">Average FPS</div>
        <div>{{ performanceStats.averageFps.toFixed(1) }}</div>
      </div>
      <div class="bg-white/10 rounded p-2">
        <div class="text-xs text-white/60">Total Frames</div>
        <div>{{ performanceStats.totalFrames }}</div>
      </div>
    </div>

    <!-- Active Animations -->
    <div class="space-y-2">
      <div
        v-for="anim in activeAnimations"
        :key="anim.id"
        class="bg-white/10 rounded p-2"
      >
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm">{{ anim.id }}</span>
          <span
            class="text-xs px-1.5 py-0.5 rounded"
            :class="getStatusColor(anim.fps)"
          >
            {{ anim.fps.toFixed(0) }} FPS
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            class="absolute inset-0 transition-all duration-100"
            :class="getProgressColor(anim.progress)"
            :style="{ width: `${anim.progress}%` }"
          ></div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-2 gap-x-4 mt-2 text-xs text-white/60">
          <div>Progress: {{ anim.progress.toFixed(1) }}%</div>
          <div>Frames: {{ anim.frameCount }}</div>

          <div v-if="metrics[anim.id]">
            Distance: {{ formatDistance(metrics[anim.id].distance) }}
          </div>
          <div v-if="metrics[anim.id]">
            Time Left: {{ formatTime(metrics[anim.id].remainingTime) }}
          </div>
        </div>
      </div>

      <div
        v-if="!activeAnimations.length"
        class="text-sm text-white/40 text-center py-2"
      >
        No active animations
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { markerAnimationTracker } from "@/utils/markerAnimationTracker";

const activeAnimations = ref<
  Array<{
    id: string;
    progress: number;
    fps: number;
    frameCount: number;
  }>
>([]);

const metrics = ref<
  Record<
    string,
    {
      distance: number;
      remainingTime: number;
    }
  >
>({});

const performanceStats = ref<{
  averageFps: number;
  totalFrames: number;
} | null>(null);

// Update loop
let animationFrame: number;
function updateStats() {
  performanceStats.value = markerAnimationTracker.getPerformanceStats();

  // Update metrics for each animation
  activeAnimations.value.forEach((anim) => {
    const animMetrics = markerAnimationTracker.getAnimationMetrics(anim.id);
    if (animMetrics) {
      metrics.value[anim.id] = {
        distance: animMetrics.distance,
        remainingTime: animMetrics.remainingTime,
      };
    }
  });

  animationFrame = requestAnimationFrame(updateStats);
}

function getStatusColor(fps: number) {
  if (fps >= 55) return "bg-green-500/20 text-green-400";
  if (fps >= 30) return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
}

function getProgressColor(progress: number) {
  if (progress >= 90) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  return "bg-yellow-500";
}

function formatDistance(meters: number) {
  return meters < 1000
    ? `${meters.toFixed(1)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

function formatTime(ms: number) {
  return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// Subscribe to animation updates
onMounted(() => {
  const unsubscribe = markerAnimationTracker.subscribe((animations) => {
    activeAnimations.value = animations;
  });

  // Start update loop
  updateStats();

  onUnmounted(() => {
    unsubscribe();
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
});
</script>
