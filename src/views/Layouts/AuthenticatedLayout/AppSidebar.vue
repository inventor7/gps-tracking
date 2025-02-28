<template>
  <Sidebar
    class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
    v-bind="props"
  >
    <!-- Main Navigation Sidebar -->
    <Sidebar
      collapsible="none"
      class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
              <a href="#">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <Map class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">GPS Tracking</span>
                  <span class="truncate text-xs">Live Tracking</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent class="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.name">
                <SidebarMenuButton
                  :tooltip="h('div', { hidden: false }, item.name)"
                  :is-active="activeItem.name === item.name"
                  class="px-2.5 md:px-2"
                  @click="handleNavigate(item)"
                >
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.name }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser :user="user" />
      </SidebarFooter>
    </Sidebar>

    <!-- Secondary Sidebar -->
    <Sidebar collapsible="none" class="hidden flex-1 md:flex">
      <SidebarHeader class="gap-3.5 border-b p-3">
        <div class="flex w-full items-center justify-between">
          <div class="text-base font-medium text-foreground">
            {{ activeItem.name }}
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="h-7 w-7"> </Button>

            <Button
              v-if="activeItem.route === 'home'"
              variant="outline"
              size="icon"
              class="h-7 w-7"
            >
              <Maximize2 />
            </Button>
            <Button
              v-if="activeItem.route === 'home'"
              variant="outline"
              size="icon"
              class="h-7 w-7"
            >
              <Filter />
            </Button>
          </div>
        </div>
        <SidebarInput v-model="searchTerm" placeholder="Type to search..." />
      </SidebarHeader>

      <SidebarContent>
        <component :is="activeItem.component" v-if="activeItem.component" />
      </SidebarContent>
    </Sidebar>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { useRouter } from "vue-router";
import { Map, History, Activity, Filter, Maximize2 } from "lucide-vue-next";
import { useSidebar, type SidebarProps } from "@/components/ui/sidebar";
import RealTimeSidePanel from "@/views/pages/RealTime/RealTimeSidePanel.vue";
import HistorySidePanel from "@/views/pages/History/HistorySidePanel.vue";
import AnalyticsSidePanel from "@/views/pages/Analytics/AnalyticsSidePanel.vue";
import { useActorsStore } from "../../../stores/actors";

interface NavigationItem {
  name: string;
  route: string;
  icon: any;
  component: any;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});
const actorStore = useActorsStore();

const { searchTerm } = storeToRefs(actorStore);
const { setOpen } = useSidebar();
const router = useRouter();

// User data
const user = {
  name: "Admin User",
  email: "admin@example.com",
  avatar: "/avatars/default.png",
};

const navigation: NavigationItem[] = [
  {
    name: "Live Tracking",
    route: "Home",
    icon: Map,
    component: shallowRef(RealTimeSidePanel),
  },
  {
    name: "History",
    route: "History",
    icon: History,
    component: shallowRef(HistorySidePanel),
  },
  {
    name: "Analytics",
    route: "Analytics",
    icon: Activity,
    component: shallowRef(AnalyticsSidePanel),
  },
];

const activeItem = ref(navigation[0]);

const handleNavigate = (item: NavigationItem) => {
  activeItem.value = item;
  setOpen(true);
  router.push({ name: item.route });
};
</script>
