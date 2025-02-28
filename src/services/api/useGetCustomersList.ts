import { useApi } from "@/composables/api/useApi";
import type { Customer, CustomerQueryParams } from "@/types/customer";

export function useGetCustomersList() {
  const query = useApi<Customer[]>("pos");

  const execute = (params: CustomerQueryParams) => {
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
