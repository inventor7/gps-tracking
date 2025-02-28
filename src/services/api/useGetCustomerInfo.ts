import { useApi } from "@/composables/api/useApi";
import type { Customer } from "@/types/customer";

interface CustomerInfoParams {
  id: number;
  actor_ids: number[];
  date_from: Date | null;
  date_to: Date | null;
}

export function useGetCustomerInfo() {
  const query = useApi<Customer>("get-pos-info");

  const execute = (params: CustomerInfoParams) => {
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
