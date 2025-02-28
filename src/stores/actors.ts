import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useGetActorsList } from "@/services/api/useGetActorsList";
import { useGetActorPositions } from "@/services/api/useGetActorPositions";
import { useGetActorInfo } from "@/services/api/useGetActorInfo";
import { useEnv } from "@/composables/useEnv";
import type { APIError } from "@/composables/api/useApi";
import type {
  Actor,
  ActorFilter,
  ActorInfo,
  ActorPositions,
  QueryParams,
  ActorPositionParams,
  ActorPosition,
  ActorRealTimePositionParams,
} from "@/types/actor";
import { useMapStore } from "./map";
import { useRealTimeMarkers } from "./useRealTimeMarkersStore";
import { useGetRealTimeActorPosition } from "@/services/api/useGetRealTimeActorPosition";

export const useActorsStore = defineStore("actors", () => {
  const env = useEnv();

  //stores
  const mapStore = useMapStore();
  const realTimeMarkers = useRealTimeMarkers();

  const actors = ref<Actor[]>([]);
  const selectedActor = ref<Actor>();
  const selectedActors = ref<Actor[]>([]);
  const actorRealTimePosition = ref<ActorPosition>({});
  const actorPositions = ref<ActorPositions>({});

  const searchTerm = ref<string>("");
  const actorFilters = ref<ActorFilter[]>([]);
  const updateInterval = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // API Services
  const actorsListService = useGetActorsList();
  const actorPositionsService = useGetActorPositions();
  const actorRealTimePositionsService = useGetRealTimeActorPosition();

  const actorInfoService = useGetActorInfo();

  // Getters

  const filteredActors = computed(() => {
    const searchedWords = searchTerm.value.toLowerCase().split(" ");
    const filtered = actors.value.filter((actor) => {
      const actorName = actor.name.toLowerCase();
      return searchedWords.every((word) => actorName.includes(word));
    });

    return filtered;
  });

  const getActorPosition = computed(() => {
    return (actorId: number) => {
      const positions = actorPositions.value[actorId];
      if (!positions || positions.length === 0) {
        return null;
      }
      return positions[positions.length - 1];
    };
  });

  // Actions
  const fetchActors = async (params?: QueryParams) => {
    const { execute } = actorsListService;

    actorsListService.onResultSuccess((data: Actor[]) => {
      actors.value = data;
    });

    actorsListService.onResultError((error: APIError) => {});

    await execute();
  };

  const fetchActorPositions = async (params: ActorPositionParams) => {
    const { execute } = actorPositionsService;

    actorPositionsService.onResultSuccess((data: ActorPositions) => {
      actorPositions.value = data;
    });

    actorPositionsService.onResultError((error: APIError) => {
      console.log(error);
    });

    await execute(params);
  };

  const fetchRealTimeActorPosition = async (
    params: ActorRealTimePositionParams
  ) => {
    const { execute } = actorRealTimePositionsService;

    actorRealTimePositionsService.onResultSuccess((data: ActorPosition) => {
      actorRealTimePosition.value = data;
    });

    actorRealTimePositionsService.onResultError((error: APIError) => {
      console.log(error);
    });

    await execute(params);
  };

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

  const startPositionUpdates = (
    intervalMs: number = Number(env.UPDATE_INTERVAL)
  ) => {
    if (updateInterval.value) {
      return;
    }

    // Initial fetch
    const selectedActorsIds = selectedActors.value.map((actor) => actor.id);

    if (selectedActorsIds.length > 0) {
      fetchRealTimeActorPosition({
        ids: selectedActorsIds,
      });
    } else {
      console.log("NO SELECTED ACTORS");
    }

    // Start interval
    updateInterval.value = window.setInterval(() => {
      const selectedActorsIds = actors.value.map((actor) => actor.id);

      if (selectedActorsIds.length > 0) {
        fetchActorPositions({
          ids: selectedActorsIds,
          date_from: null,
          date_to: null,
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
      await fetchRealTimeActorPosition({
        ids: [actor.id],
      });

      console.log("Actor from params ", actor);
      console.log("actorRealTimePosition.value ", actorRealTimePosition.value);
      const position = actorRealTimePosition.value[actor.id];

      if (position) {
        // Pan map to selected actor's position and zoom in
        mapStore.panTo({
          lat: position.latitude,
          lng: position.longitude,
        });
        mapStore.setZoom(15);

        // Update marker position if it exists
        mapStore.updateMarkerPosition(actor, position);
      }
    }
  };

  const getCurrentPosition = (actorId: number) => {
    const positions = actorPositions.value[actorId];

    if (!positions || positions.length === 0) return null;

    return positions[positions.length - 1];
  };

  return {
    // State
    actors,
    selectedActors,
    actorPositions,
    actorRealTimePosition,
    actorFilters,
    isLoading,
    error,

    // Getters
    selectedActor,
    searchTerm,
    filteredActors,
    getActorPosition,

    // Actions
    fetchActors,
    fetchActorPositions,
    fetchRealTimeActorPosition,
    fetchActorInfo,
    startPositionUpdates,
    stopPositionUpdates,
    selectActor,

    //Positions
    getCurrentPosition,
  };
});
