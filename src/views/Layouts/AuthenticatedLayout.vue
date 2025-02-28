<template>
  <SidebarProvider
    :style="{
      '--sidebar-width': '360px',
    }"
  >
    <AppSidebar />

    <SidebarInset>
      <header
        class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-3"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <!-- idea to implement the real time interval indicator animation every interaval time -->
      </header>

      <div class="flex flex-1 overflow-hidden">
        <router-view v-slot="{ Component, route }">
          <transition name="slide-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script lang="ts"></script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
