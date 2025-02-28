import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useGetCustomersList } from "@/services/api/useGetCustomersList";
import { useGetCustomerInfo } from "@/services/api/useGetCustomerInfo";
import type {
  Customer,
  CustomerFilter,
  CustomerFilterInput,
  CustomerQueryParams,
  CustomerInfoParams,
} from "@/types/customer";

export const useCustomersStore = defineStore("customers", () => {
  // State
  const customers = ref<Customer[]>([]);
  const customerFilters = ref<CustomerFilter[]>([]);
  const selectedCustomerId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // API Services
  const customersListService = useGetCustomersList();
  const customerInfoService = useGetCustomerInfo();

  // Getters
  const selectedCustomer = computed(() => {
    if (!selectedCustomerId.value) return null;
    return customers.value.find(
      (customer) => customer.id === selectedCustomerId.value
    );
  });

  const filteredCustomers = computed(() => {
    // Add filtering logic here if needed
    return customers.value;
  });

  // Actions
  const fetchCustomers = async (params: CustomerQueryParams) => {
    const { execute } = customersListService;

    customersListService.onResultSuccess((result) => {
      customers.value = result;
    });

    customersListService.onResultError((error) => {
      console.error("Error fetching customers:", error);
    });

    await execute(params);
  };

  const fetchCustomerInfo = async (params: CustomerInfoParams) => {
    const { execute } = customerInfoService;

    customerInfoService.onResultSuccess((result) => {
      // Update customer info in the customers list
      const index = customers.value.findIndex(
        (customer) => customer.id === params.id
      );
      if (index !== -1) {
        customers.value[index] = { ...customers.value[index], ...result };
      }
      return result;
    });

    customerInfoService.onResultError((error) => {
      console.error("Error fetching customer info:", error);
      return null;
    });

    await execute(params);
  };

  const selectCustomer = (customerId: number | null) => {
    selectedCustomerId.value = customerId;
  };

  const clearCustomers = () => {
    customers.value = [];
    selectedCustomerId.value = null;
  };

  const updateCustomerFilters = (filters: CustomerFilterInput[]) => {
    const currentParams: CustomerQueryParams = {
      actor_ids: [], // This should be populated from the actors store
      filters,
      date_from: null,
      date_to: null,
    };
    return fetchCustomers(currentParams);
  };

  return {
    // State
    customers,
    customerFilters,
    selectedCustomerId,
    isLoading,
    error,

    // Getters
    selectedCustomer,
    filteredCustomers,

    // Actions
    fetchCustomers,
    fetchCustomerInfo,
    selectCustomer,
    clearCustomers,
    updateCustomerFilters,
  };
});
