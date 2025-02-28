<template>
  <div class="h-full w-full relative">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full">
      <!-- Map will be mounted here -->
    </div>

    <!-- History Controls Panel -->
    <div
      class="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10"
    >
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">History View</h3>

        <!-- Date Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Select Date</label>
          <input
            type="date"
            v-model="selectedDateStr"
            :max="today"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <!-- Actor Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Select Actor</label>
          <select
            v-model="selectedActorId"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select an actor</option>
            <option v-for="actor in actors" :key="actor.id" :value="actor.id">
              {{ actor.name }}
            </option>
          </select>
        </div>

        <!-- Route Comparison -->
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <Switch v-model="showTheoreticalRoute" />
            <span class="text-sm font-medium">Show Theoretical Route</span>
          </label>
          <label class="flex items-center gap-2">
            <Switch v-model="showActualRoute" />
            <span class="text-sm font-medium">Show Actual Route</span>
          </label>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-2">
          <Button
            @click="openReplayMode"
            :disabled="!canOpenReplay"
            variant="outline"
          >
            Open in Replay Mode
          </Button>
        </div>
      </div>
    </div>

    <!-- Customer Info Panel (shown when customer is selected) -->
    <div
      v-if="selectedCustomer"
      class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 z-10"
    >
      <div class="space-y-4">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold">{{ selectedCustomer.name }}</h4>
            <p class="text-sm text-gray-600">{{ selectedCustomer.ref }}</p>
          </div>
          <Button variant="ghost" size="icon" @click="clearSelectedCustomer">
            <XIcon class="h-4 w-4" />
          </Button>
        </div>

        <div class="space-y-2 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-gray-600">Address</p>
              <p>{{ selectedCustomer.street }}</p>
              <p v-if="selectedCustomer.street2">
                {{ selectedCustomer.street2 }}
              </p>
              <p>{{ selectedCustomer.city }}, {{ selectedCustomer.state }}</p>
            </div>
            <div>
              <p class="text-gray-600">Contact</p>
              <p v-if="selectedCustomer.phone">{{ selectedCustomer.phone }}</p>
              <p v-if="selectedCustomer.mobile">
                {{ selectedCustomer.mobile }}
              </p>
            </div>
          </div>

          <!-- Custom Attributes -->
          <div v-if="selectedCustomer.partner_custom_attributes.length > 0">
            <p class="text-gray-600 mb-1">Additional Information</p>
            <div class="space-y-1">
              <div
                v-for="attr in selectedCustomer.partner_custom_attributes"
                :key="attr.label"
                class="flex items-center gap-2"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: attr.color }"
                ></span>
                <span>{{ attr.label }}: {{ attr.value }}</span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div v-if="selectedCustomer.stats.length > 0">
            <p class="text-gray-600 mb-1">Statistics</p>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="stat in selectedCustomer.stats" :key="stat.label">
                <p class="text-gray-600">{{ stat.label }}</p>
                <p>{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { XIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMapStore } from "@/stores/map";
import { useActorsStore } from "@/stores/actors";
import { useCustomersStore } from "@/stores/customers";
import type { Customer } from "@/types/customer";

const router = useRouter();
const mapContainer = ref<HTMLElement | null>(null);
const selectedDateStr = ref(new Date().toISOString().split("T")[0]);
const selectedActorId = ref<number | null>(null);
const showTheoreticalRoute = ref(true);
const showActualRoute = ref(true);

const today = new Date().toISOString().split("T")[0];

const mapStore = useMapStore();
const actorsStore = useActorsStore();
const customersStore = useCustomersStore();

const { actors } = storeToRefs(actorsStore);
const { selectedCustomer } = storeToRefs(customersStore);

const selectedDate = computed(() =>
  selectedDateStr.value ? new Date(selectedDateStr.value) : null
);

const canOpenReplay = computed(() => {
  return selectedDate.value && selectedActorId.value;
});

onMounted(async () => {
  if (!mapContainer.value) return;

  await mapStore.initializeMap(mapContainer.value);
  await actorsStore.fetchActors();

  // Load initial data based on selected date and actor
  loadHistoricalData();
});

onUnmounted(() => {
  mapStore.destroyMap();
});

const loadHistoricalData = async () => {
  if (!selectedActorId.value || !selectedDate.value) return;

  const date = selectedDate.value;
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Fetch historical positions
  await actorsStore.fetchActorPositions({
    ids: [selectedActorId.value],
    date_from: date,
    date_to: nextDay,
  });

  // Fetch customers for the selected actor and date
  await customersStore.fetchCustomers({
    actor_ids: [selectedActorId.value],
    filters: [],
    date_from: date,
    date_to: nextDay,
  });
};

const clearSelectedCustomer = () => {
  customersStore.selectCustomer(null);
};

const openReplayMode = () => {
  if (!selectedActorId.value || !selectedDate.value) return;

  router.push({
    name: "replay",
    params: {
      actorId: selectedActorId.value.toString(),
    },
    query: {
      date: selectedDate.value.toISOString(),
    },
  });
};

watch([selectedDateStr, selectedActorId], () => {
  loadHistoricalData();
});
</script>

<style scoped>
input[type="date"] {
  appearance: none;
  background-color: transparent;
  cursor: pointer;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}
</style>
