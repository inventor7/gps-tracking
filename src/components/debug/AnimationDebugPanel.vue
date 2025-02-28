<template>
  <div
    class="fixed bottom-4 right-4 bg-black/80 text-white rounded-lg shadow-lg p-4 z-50 text-xs font-mono"
    style="width: 300px; max-height: 400px"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Animation Debug</h3>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :class="{ 'opacity-50': !enabled }"
          @click="toggleAnimations"
          title="Toggle animations"
        >
          <div class="flex items-center gap-1">
            <Play v-if="enabled" class="h-3 w-3" />
            <Pause v-else class="h-3 w-3" />
          </div>
        </Button>
      </div>
    </div>

    <div class="space-y-4 overflow-auto" style="max-height: 320px">
      <!-- Global Stats -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-white/10 rounded p-2">
          <div class="text-white/60">Active</div>
          <div>{{ activeAnimations.length }}</div>
        </div>
        <div class="bg-white/10 rounded p-2">
          <div class="text-white/60">Avg FPS</div>
          <div>{{ averageFps.toFixed(1) }}</div>
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
            <span>{{ formatId(anim.id) }}</span>
            <span
              class="px-2 py-0.5 rounded text-xs"
              :class="getFpsColor(anim.fps)"
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

          <!-- Animation Details -->
          <div class="grid grid-cols-2 gap-x-4 mt-2 text-xs text-white/60">
            <div>Duration: {{ anim.duration }}ms</div>
            <div>Frame: {{ anim.frameCount }}</div>
            <div>Progress: {{ anim.progress.toFixed(1) }}%</div>
            <div>
              <Tooltip>
                <TooltipTrigger
                  >Distance:
                  {{ formatDistance(getDistance(anim)) }}</TooltipTrigger
                >
                <TooltipContent>
                  <div class="text-xs">
                    Start: {{ formatLatLng(anim.startPosition) }}<br />
                    End: {{ formatLatLng(anim.targetPosition) }}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          v-if="!activeAnimations.length"
          class="text-center py-2 text-white/40"
        >
          No active animations
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Pause } from "lucide-vue-next";
import { createLogger } from "@/utils/logger";
import { debugConfig } from "@/utils/debugConfig";
import { markerAnimationTracker } from "@/utils/markerAnimationTracker";
import type { AnimationDebugInfo } from "@/types/debug";

const logger = createLogger("AnimationDebugPanel");
const updateInterval = ref<number | null>(null);
const activeAnimations = ref<AnimationDebugInfo[]>([]);
const enabled = ref(debugConfig.performance.trackAnimations);

const averageFps = computed(() => {
  if (activeAnimations.value.length === 0) return 0;
  const totalFps = activeAnimations.value.reduce(
    (sum, anim) => sum + anim.fps,
    0
  );
  return totalFps / activeAnimations.value.length;
});

function getDistance(animation: AnimationDebugInfo): number {
  return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(animation.startPosition),
    new google.maps.LatLng(animation.targetPosition)
  );
}

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${meters.toFixed(1)}m`
    : `${(meters / 1000).toFixed(2)}km`;
}

function formatLatLng(pos: google.maps.LatLngLiteral): string {
  return `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
}

function formatId(id: string): string {
  return id.length > 15 ? id.slice(0, 12) + "..." : id;
}

function getFpsColor(fps: number): string {
  if (fps >= 55) return "bg-green-500/20 text-green-400";
  if (fps >= 30) return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
}

function getProgressColor(progress: number): string {
  if (progress >= 90) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  return "bg-yellow-500";
}

function toggleAnimations() {
  enabled.value = !enabled.value;
  debugConfig.setPerformanceTracking("trackAnimations", enabled.value);
  logger.debug("Animations tracking:", enabled.value ? "enabled" : "disabled");
}

function updateStats() {
  if (!enabled.value) {
    activeAnimations.value = [];
    return;
  }

  const animations = markerAnimationTracker.getActiveAnimations();
  activeAnimations.value = animations;
}

// Start periodic updates
onMounted(() => {
  updateStats();
  updateInterval.value = window.setInterval(
    updateStats,
    debugConfig.autoRefresh.interval
  );
  logger.debug("Animation debug panel mounted");
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
  logger.debug("Animation debug panel unmounted");
});
</script>
