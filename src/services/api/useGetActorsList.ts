import { useApi } from "@/composables/api/useApi";
import type { Actor } from "@/types/actor";

export function useGetActorsList() {
  const query = useApi<Actor[]>("/actor", {});

  const execute = async () => {
    return query.execute({
      method: "GET",
    });
  };

  return {
    ...query,
    execute,
  };
}
