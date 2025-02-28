import { useApi } from "@/composables/api/useApi";
import type { ActorPositions, ActorPositionParams } from "@/types/actor";

export function useGetActorPositions() {
  const query = useApi<ActorPositions>("/actor-position", {});

  const execute = async (params: ActorPositionParams) => {
    const formatedParams = {
      ids: JSON.stringify(params.ids),
      date_from: params.date_from,
      date_to: params.date_to,
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
