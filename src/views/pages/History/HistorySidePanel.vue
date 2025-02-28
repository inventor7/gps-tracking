<template>
  <div>{{ actors }}</div>
</template>
<script setup lang="ts">
import { useActorsStore } from "@/stores/actors";

const { actors } = storeToRefs(useActorsStore());
</script>
