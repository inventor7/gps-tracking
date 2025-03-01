import { useApi } from "@/composables/api/useApi";
import type { ActorsHPositionParams, ActorsHPositions } from "@/types/actor";

export function useGetActorPositions() {
  const query = useApi<ActorsHPositions>("/actor-position", {});

  const execute = async (params: ActorsHPositionParams) => {
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
