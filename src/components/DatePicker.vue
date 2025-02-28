<template>
  <div class="date-picker">
    <Calendar
      v-model="internalDate"
      class="p-2 rounded-md border"
      :disabled="(date: Date) => isAfter(date, new Date())"
      :selected-date="modelValue"
      mode="single"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Calendar } from "@/components/ui/calendar";
import { isAfter } from "date-fns";
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

const props = defineProps<{
  modelValue: DateValue;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Date): void;
}>();

const internalDate = computed({
  get() {
    return props.modelValue;
  },
  set(value: Date | null) {
    if (value) {
      emit("update:modelValue", value);
    }
  },
});
</script>

<style scoped>
.date-picker {
  --calendar-width: 280px;
  --calendar-height: 300px;
}

.date-picker :deep(.calendar) {
  width: var(--calendar-width);
  max-height: var(--calendar-height);
}
</style>
