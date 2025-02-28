import { inject, computed, type Ref } from "vue";
import { type RawAxiosRequestConfig } from "axios";
import { useAxios, type UseAxiosOptions } from "@vueuse/integrations/useAxios";
import { createEventHook, whenever } from "@vueuse/core";
import { createApiInstance } from "@/services/api/createApiInstance";

export interface APIError {
  code: number;
  message: string;
  data: {
    name: string;
    debug: string;
    message: string;
    arguments: string[];
    exception_type: string;
    context: any;
  };
}

interface APISuccess<T> {
  result: T;
}

type ApiResult<T> = APISuccess<T> | { error: APIError };

export interface ACKResponse {
  done: boolean;
}

export function useApi<T>(
  path: string = "",
  config: RawAxiosRequestConfig<any> = {},
  options: UseAxiosOptions & { initialData?: any } = {
    immediate: false,
    shallow: true,
    initialData: undefined,
  }
) {
  const instance = createApiInstance();
  const query = useAxios<ApiResult<T>>(path, config, instance, options);

  const onResultSuccess = createEventHook<any>();
  const onResultError = createEventHook<APIError>();
  const onErrorString = createEventHook<string>();

  const result = computed<T>(() => {
    if (query.data.value && "result" in query.data.value)
      return query.data.value.result;

    return options.initialData;
  });

  const resultError = computed<APIError | undefined>(() => {
    if (query.data.value && "error" in query.data.value)
      return query.data.value.error;

    return undefined;
  });

  const errorString = computed<string | undefined>(() => {
    if (resultError.value !== undefined) return resultError.value.data.message;
    if (query.error.value !== undefined && query.error.value instanceof Error)
      return query.error.value.message;
    return undefined;
  });

  whenever(query.isFinished, () => {
    if (errorString.value !== undefined) {
      onErrorString.trigger(errorString.value);
    }

    if (query.data.value !== undefined) {
      if ("result" in query.data.value)
        onResultSuccess.trigger(query.data.value.result);

      if ("error" in query.data.value) {
        onResultError.trigger(query.data.value.error);
      }
    }
  });

  return {
    ...query,
    result,
    resultError,
    errorString,
    onResultSuccess: onResultSuccess.on,
    onResultError: onResultError.on,
    onErrorString: onErrorString.on,
  };
}
