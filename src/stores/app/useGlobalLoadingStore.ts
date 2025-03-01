export const useGlobalLoading = defineStore("globalLoading", () => {
  const network = computed(() => {
    return reactive(useNetwork());
  });

  const isGlobalLoading = ref(false);

  return { isGlobalLoading, network };
});
