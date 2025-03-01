import { useApi } from "@/composables/api/useApi";
import type { ActorsRTosition, ActorsRTPositionParams } from "@/types/actor";

export function useGetRTActorsPosition() {
  const query = useApi<ActorsRTosition>("/actor-position", {});

  const execute = async (params: ActorsRTPositionParams) => {
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
