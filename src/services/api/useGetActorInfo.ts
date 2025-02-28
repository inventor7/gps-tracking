import { useApi } from "@/composables/api/useApi";
import type { ActorInfo } from "@/types/actor";

interface ActorInfoParams {
  id: number;
  date?: Date | null;
}

export function useGetActorInfo() {
  const query = useApi<ActorInfo>("/get-actor-info", {});

  const execute = async (params: ActorInfoParams) => {
    return query.execute({
      method: "GET",
      params,
    });
  };

  return {
    ...query,
    execute,
  };
}
