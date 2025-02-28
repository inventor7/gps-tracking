<template>
  <div class="h-full w-full flex">
    <!-- Map Section -->
    <div class="flex-1 relative">
      <div ref="mapContainer" class="w-full h-full">
        <!-- Map will be mounted here -->
      </div>
    </div>

    <!-- Analytics Panel -->
    <div class="w-96 border-l bg-background overflow-y-auto">
      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-lg font-semibold">Analytics</h2>
          <p class="text-sm text-muted-foreground">
            View unvisited customers and route analysis
          </p>
        </div>

        <!-- Date Range Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Date Range</label>
          <div class="grid grid-cols-2 gap-2">
            <input
              type="date"
              v-model="startDateStr"
              :max="today"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              v-model="endDateStr"
              :max="today"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <!-- Actor Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Select Actor</label>
          <select
            v-model="selectedActorId"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Actors</option>
            <option v-for="actor in actors" :key="actor.id" :value="actor.id">
              {{ actor.name }}
            </option>
          </select>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-lg bg-secondary">
            <p class="text-sm text-muted-foreground">Total Customers</p>
            <p class="text-2xl font-semibold">{{ stats.totalCustomers }}</p>
          </div>
          <div class="p-4 rounded-lg bg-secondary">
            <p class="text-sm text-muted-foreground">Unvisited</p>
            <p class="text-2xl font-semibold">{{ stats.unvisitedCustomers }}</p>
          </div>
          <div class="p-4 rounded-lg bg-secondary">
            <p class="text-sm text-muted-foreground">Visit Rate</p>
            <p class="text-2xl font-semibold">{{ stats.visitRate }}%</p>
          </div>
          <div class="p-4 rounded-lg bg-secondary">
            <p class="text-sm text-muted-foreground">Avg. Time/Visit</p>
            <p class="text-2xl font-semibold">{{ stats.avgVisitTime }}m</p>
          </div>
        </div>

        <!-- Unvisited Customers List -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Unvisited Customers</h3>
            <Button variant="outline" size="sm" @click="exportUnvisitedList">
              <Download class="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div class="space-y-2">
            <div
              v-for="customer in unvisitedCustomers"
              :key="customer.id"
              class="p-3 rounded-md border cursor-pointer hover:bg-accent"
              @click="showCustomerOnMap(customer)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{{ customer.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ customer.ref }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  @click.stop="showCustomerDetails(customer)"
                >
                  <Info class="h-4 w-4" />
                </Button>
              </div>
              <p class="text-sm mt-1">
                {{ customer.street }}, {{ customer.city }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-vue-next";
import { useMapStore } from "@/stores/map";
import { useActorsStore } from "@/stores/actors";
import { useCustomersStore } from "@/stores/customers";
import type { Customer } from "@/types/customer";

const mapContainer = ref<HTMLElement | null>(null);
const today = new Date().toISOString().split("T")[0];
const startDateStr = ref(today);
const endDateStr = ref(today);
const selectedActorId = ref<number | null>(null);

const mapStore = useMapStore();
const actorsStore = useActorsStore();
const customersStore = useCustomersStore();

const { actors } = storeToRefs(actorsStore);
const { customers } = storeToRefs(customersStore);

// Mock data for now - this would come from API
const stats = ref({
  totalCustomers: 0,
  unvisitedCustomers: 0,
  visitRate: 0,
  avgVisitTime: 0,
});

const unvisitedCustomers = ref<Customer[]>([]);

onMounted(async () => {
  if (!mapContainer.value) return;

  await mapStore.initializeMap(mapContainer.value);
  await actorsStore.fetchActors();
  await loadAnalyticsData();
});

onUnmounted(() => {
  mapStore.destroyMap();
});

const loadAnalyticsData = async () => {
  const startDate = new Date(startDateStr.value);
  const endDate = new Date(endDateStr.value);

  // Fetch customers for the date range and actor
  await customersStore.fetchCustomers({
    actor_ids: selectedActorId.value ? [selectedActorId.value] : [],
    filters: [],
    date_from: startDate,
    date_to: endDate,
  });

  // Update stats and unvisited customers list
  // This would normally come from an API endpoint
  stats.value = {
    totalCustomers: customers.value.length,
    unvisitedCustomers: Math.floor(customers.value.length * 0.3), // Mock 30% unvisited
    visitRate: 70,
    avgVisitTime: 15,
  };

  // Mock unvisited customers for now
  unvisitedCustomers.value = customers.value.slice(
    0,
    stats.value.unvisitedCustomers
  );
};

const showCustomerOnMap = (customer: Customer) => {
  mapStore.panTo({
    lat: customer.latitude,
    lng: customer.longitude,
  });
};

const showCustomerDetails = (customer: Customer) => {
  // Implement customer details dialog/modal
  console.log("Show details for customer:", customer.id);
};

const exportUnvisitedList = () => {
  // Implement export functionality
  const csvContent = unvisitedCustomers.value
    .map(
      (customer) =>
        `${customer.ref},${customer.name},${customer.street},${customer.city}`
    )
    .join("\n");

  const blob = new Blob([`Ref,Name,Street,City\n${csvContent}`], {
    type: "text/csv",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `unvisited-customers-${startDateStr.value}-${endDateStr.value}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

watch([startDateStr, endDateStr, selectedActorId], () => {
  loadAnalyticsData();
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
