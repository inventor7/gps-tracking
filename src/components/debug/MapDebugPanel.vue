<template>
  <div class="fixed top-4 left-4 flex flex-col gap-4">
    <!-- Main Debug Panel -->
    <div
      class="bg-black/80 text-white rounded-lg shadow-lg p-4 z-50 text-xs font-mono"
      style="width: 400px; max-height: 90vh"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold">Map Debug Panel</h3>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            :class="{ 'opacity-50': !showAnimations }"
            @click="toggleAnimations"
            title="Toggle animation panel"
          >
            <Play v-if="!showAnimations" class="h-3 w-3" />
            <Pause v-else class="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="refresh"
            title="Refresh debug info"
          >
            <RefreshCw class="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div
        class="space-y-4 overflow-auto"
        style="max-height: calc(90vh - 4rem)"
      >
        <!-- Map Health Status -->
        <div class="space-y-2 p-2 bg-white/5 rounded">
          <div class="flex items-center space-x-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="debugStats.health.healthy ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span
              >Map Health:
              {{ debugStats.health.healthy ? "Good" : "Issues Detected" }}</span
            >
          </div>
          <div v-if="!debugStats.health.healthy" class="pl-4 text-red-400">
            <div v-for="(issue, i) in debugStats.health.issues" :key="i">
              - {{ issue }}
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-white/10 rounded p-2">
            <div class="text-white/60">Total Markers</div>
            <div>{{ debugStats.health.stats.totalMarkers }}</div>
          </div>
          <div class="bg-white/10 rounded p-2">
            <div class="text-white/60">Visible Markers</div>
            <div>{{ debugStats.health.stats.visibleMarkers }}</div>
          </div>
          <div class="bg-white/10 rounded p-2">
            <div class="text-white/60">Paths Active</div>
            <div>{{ pathVisualization.totalPaths }}</div>
          </div>
          <div class="bg-white/10 rounded p-2">
            <div class="text-white/60">Avg Path Length</div>
            <div>{{ pathVisualization.averagePathLength.toFixed(1) }}</div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="space-y-1 p-2 bg-white/5 rounded">
          <h4 class="font-semibold mb-2">Performance</h4>
          <div
            v-for="metric in sortedMetrics"
            :key="metric.name"
            class="flex items-center gap-2"
          >
            <div class="w-32 truncate">{{ metric.name }}</div>
            <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="getMetricColor(metric.duration)"
                :style="{ width: `${getMetricWidth(metric.duration)}%` }"
              ></div>
            </div>
            <div class="w-16 text-right">
              {{ metric.duration.toFixed(1) }}ms
            </div>
          </div>
        </div>

        <!-- Marker Status -->
        <div class="space-y-2">
          <div class="font-semibold sticky top-0 bg-black/80 py-1">
            Marker Status
          </div>
          <div
            v-for="marker in debugStats.markers"
            :key="marker.id"
            class="bg-white/10 rounded p-2 space-y-1"
          >
            <div class="flex items-center justify-between">
              <span>{{ marker.id }}</span>
              <div class="flex gap-2">
                <span
                  class="px-2 py-0.5 rounded text-xs"
                  :class="marker.visible ? 'bg-green-500/20' : 'bg-red-500/20'"
                >
                  {{ marker.visible ? "Visible" : "Hidden" }}
                </span>
                <span
                  v-if="marker.hasPath"
                  class="px-2 py-0.5 rounded text-xs bg-blue-500/20"
                >
                  Path: {{ marker.pathLength }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Animation Debug Panel -->
    <Transition>
      <AnimationDebugPanel v-if="showAnimations" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-vue-next";
import { useMapStore } from "@/stores/map";
import { performanceTracker } from "@/utils/performance";
import { getDebugStats, togglePathVisualization } from "@/utils/mapDebugger";
import { createLogger } from "@/utils/logger";
import AnimationDebugPanel from "./AnimationDebugPanel.vue";
import { debugConfig } from "@/utils/debugConfig";

const logger = createLogger("MapDebugPanel");
const updateInterval = ref<number | null>(null);
const showAnimations = ref(true);

const mapStore = useMapStore();
const metrics = ref<Array<{ name: string; duration: number }>>([]);

interface DebugState {
  health: ReturnType<typeof getDebugStats>["health"];
  markers: ReturnType<typeof getDebugStats>["markers"];
  pathVisualization: ReturnType<typeof getDebugStats>["pathVisualization"];
}

const debugStats = ref<DebugState>({
  health: {
    healthy: true,
    issues: [],
    stats: {
      totalMarkers: 0,
      visibleMarkers: 0,
      invisibleMarkers: 0,
      pathsVisualized: 0,
    },
  },
  markers: [],
  pathVisualization: {
    enabled: false,
    totalPaths: 0,
    averagePathLength: 0,
  },
});

// Sort metrics by duration (descending)
const sortedMetrics = computed(() =>
  [...metrics.value].sort((a, b) => b.duration - a.duration)
);

const pathVisualization = computed(() => debugStats.value.pathVisualization);

function getMetricColor(duration: number) {
  if (duration > 100) return "bg-red-500";
  if (duration > 50) return "bg-yellow-500";
  return "bg-green-500";
}

function getMetricWidth(duration: number) {
  return Math.min((duration / 100) * 100, 100);
}

function toggleAnimations() {
  showAnimations.value = !showAnimations.value;
}

function refresh() {
  debugStats.value = getDebugStats(mapStore.$state);

  // Get latest performance metrics
  metrics.value = performanceTracker
    .getMetrics()
    .map((m) => ({
      name: m.name,
      duration: m.duration || 0,
    }))
    .filter((m) => m.duration > 0)
    .slice(-10);
}

// Start periodic updates
onMounted(() => {
  refresh();
  updateInterval.value = window.setInterval(
    refresh,
    debugConfig.autoRefresh.interval
  );
  logger.debug("Debug panel mounted");
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
  logger.debug("Debug panel unmounted");
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
