import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useGetActorsList } from "@/services/api/useGetActorsList";
import { useGetActorInfo } from "@/services/api/useGetActorInfo";
import { useEnv } from "@/composables/useEnv";
import type { APIError } from "@/composables/api/useApi";
import type {
  Actor,
  ActorFilter,
  ActorInfo,
  ActorsHPositionParams,
  ActorsRTosition,
  ActorsRTPositionParams,
  QueryParams,
} from "@/types/actor";
import { useMapStore } from "./map";
import { useGetRTActorsPosition } from "@/services/api/useGetRTActorsPosition";

export const useRealTimeActorsStore = defineStore("realTimeActors", () => {
  const env = useEnv();

  //stores
  const mapStore = useMapStore();

  //state
  const actors = ref<Actor[]>([]);
  const selectedActor = ref<Actor>();
  const selectedActors = ref<Actor[]>([]);

  const actorsRTPosition = ref<ActorsRTosition>({});

  const searchTerm = ref<string>("");
  const actorFilters = ref<ActorFilter[]>([]);

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const updateInterval = ref<number | null>(null);

  // API Services
  const actorsListService = useGetActorsList();
  const actorsRTPositionsService = useGetRTActorsPosition();
  const actorInfoService = useGetActorInfo();

  // Getters
  const selectedActorsIds = computed(() => {
    return selectedActors.value.map((actor) => actor.id);
  });

  const filteredActors = computed(() => {
    const searchedWords = searchTerm.value.toLowerCase().split(" ");
    const filtered = actors.value.filter((actor) => {
      const actorName = actor.name.toLowerCase();
      return searchedWords.every((word) => actorName.includes(word));
    });

    return filtered;
  });

  // Actions
  const fetchActors = async (params?: QueryParams) => {
    const { execute } = actorsListService;

    actorsListService.onResultSuccess((data: Actor[]) => {
      actors.value = data;
    });

    actorsListService.onResultError((error: APIError) => {
      console.log("ERROR FETCH ACTORS", error);
    });

    await execute();
  };

  const fetchRTActorsPosition = async (params: ActorsRTPositionParams) => {
    const { execute } = actorsRTPositionsService;

    actorsRTPositionsService.onResultSuccess((data: ActorsRTosition) => {
      actorsRTPosition.value = data;
    });

    actorsRTPositionsService.onResultError((error: APIError) => {
      console.log(error);
    });

    await execute(params);
  };

  //TODO:Clarify (type + list) that sum actor + actor info
  const fetchActorInfo = async (actorId: number, date?: Date) => {
    const { execute } = actorInfoService;

    actorInfoService.onResultSuccess((data: ActorInfo) => {
      const index = actors.value.findIndex((actor) => actor.id === actorId);
      if (index !== -1) {
        actors.value[index] = { ...actors.value[index], ...data };
      } else {
      }
    });

    actorInfoService.onResultError((error: APIError) => {});

    await execute({ id: actorId, date });
  };

  const startPositionUpdates = async (
    intervalMs: number = Number(env.UPDATE_INTERVAL)
  ) => {
    if (updateInterval.value) {
      return;
    }

    if (selectedActors.value.length) {
      await fetchRTActorsPosition({
        ids: selectedActorsIds.value,
      });
    } else {
      console.log("NO SELECTED ACTORS", selectedActors.value);
    }

    //Looping
    updateInterval.value = window.setInterval(async () => {
      if (selectedActorsIds.value.length > 0) {
        await fetchRTActorsPosition({
          ids: selectedActorsIds.value,
        });
      }
    }, intervalMs);
  };

  const stopPositionUpdates = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value);
      updateInterval.value = null;
    } else {
    }
  };

  const selectActor = async (actor: Actor | undefined) => {
    selectedActor.value = actor;

    if (actor) {
      const position = actorsRTPosition.value[actor.id];

      if (position) {
        mapStore.panTo({
          lat: position.latitude,
          lng: position.longitude,
        });

        mapStore.setZoom(17);
        // if (mapStore.map?.getZoom() || 0 < 9) mapStore.setZoom(15);
      }
    }
  };

  return {
    // State
    actors,
    selectedActors,
    selectedActorsIds,
    actorsRTPosition,
    actorFilters,
    isLoading,
    error,

    // Getters
    selectedActor,
    searchTerm,
    filteredActors,

    // Actions
    fetchActors,
    fetchRTActorsPosition,
    fetchActorInfo,
    startPositionUpdates,
    stopPositionUpdates,
    selectActor,
  };
});
