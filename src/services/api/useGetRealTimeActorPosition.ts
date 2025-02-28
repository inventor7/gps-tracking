import { useApi } from "@/composables/api/useApi";
import type { ActorPosition, ActorRealTimePositionParams } from "@/types/actor";

export function useGetRealTimeActorPosition() {
  const query = useApi<ActorPosition>("/actor-position", {});

  const execute = async (params: ActorRealTimePositionParams) => {
    const formatedParams = {
      ids: JSON.stringify(params.ids),
    };

    return query.execute({
      method: "GET",
      params: formatedParams,
    });
  };

  return {
    ...query,
    execute,
  };
}
