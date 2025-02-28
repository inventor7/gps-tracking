import axios from "axios";
import { storeToRefs } from "pinia";
import { useGlobalLoading } from "@/stores/app/useGlobalLoadingStore";
import { useToast } from "@/components/ui/toast";
import { useEnv } from "@/composables/useEnv";

export function createApiInstance() {
  const env = useEnv();
  const globalLoadingStore = useGlobalLoading();
  const { isGlobalLoading } = storeToRefs(globalLoadingStore);
  const { toast } = useToast();

  const instance = axios.create({
    baseURL: env.API_BASE_URL,
    headers: {
      "request-type": "json",
      "access-token": env.API_ACCESS_TOKEN,
    },
  });

  instance.interceptors.request.use(
    (config) => {
      isGlobalLoading.value = true;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      isGlobalLoading.value = false;

      if (response.data.error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: response.data.error,
        });
      }

      return response;
    },
    (error) => {
      isGlobalLoading.value = false;

      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "An unexpected error occurred",
      });

      return Promise.reject(error);
    }
  );

  return instance;
}
