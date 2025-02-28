import { useApi } from "@/composables/api/useApi";
import type { RouteingPolyline } from "@/types/actor";

interface TheoreticalDirectionParams {
  actors_ids: number[];
  date: Date | null;
}

export function useGetTheoreticalDirection() {
  const query = useApi<RouteingPolyline[]>("theoretical-direction");

  const execute = (params: TheoreticalDirectionParams) => {
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
