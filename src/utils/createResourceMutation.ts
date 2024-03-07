import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";

export type ResourceMutationFunction<DataT, ParamT> = (
  param: ParamT,
) => Promise<DataT>;

export type ResourceMutationHookOptions<DataT, ErrorT, ParamT> = Omit<
  UseMutationOptions<DataT, ErrorT, ParamT>,
  "mutationFn"
>;

export type ResourceMutationHook<DataT, ErrorT, ParamT> = (
  options?: ResourceMutationHookOptions<DataT, ErrorT, ParamT>,
) => UseMutationResult<DataT, ErrorT, ParamT>;

export interface CreateResourceMutationOptions<ResourceT, ErrorT, ParamT>
  extends ResourceMutationHookOptions<ResourceT, ErrorT, ParamT> {
  invalidateLists?: boolean;
  persistResources?: boolean;
}

export const createResourceMutation = <
  ResourceT,
  IdT,
  DataT extends ResourceT | void,
  ErrorT,
  ParamT,
>(
  adapter: QueryAdapter<ResourceT, IdT>,
  mutationFn: ResourceMutationFunction<DataT, ParamT>,
  defaultOptions: CreateResourceMutationOptions<DataT, ErrorT, ParamT> = {},
): ResourceMutationHook<DataT, ErrorT, ParamT> => {
  const {
    persistResources = true,
    invalidateLists = true,
    ...hookDefaultOptions
  } = defaultOptions;
  return (options) => {
    const onSuccess = options?.onSuccess ?? defaultOptions.onSuccess;
    return useMutation({
      ...hookDefaultOptions,
      ...options,
      mutationFn,
      onSuccess: async (data, ...params) => {
        await onSuccess?.(data, ...params);
        if (persistResources && data) {
          adapter.setResourceCache(data as ResourceT);
        }
        if (invalidateLists) {
          await Promise.all([
            adapter.invalidateInfiniteLists(),
            adapter.invalidateLists(),
          ]);
        }
      },
    });
  };
};
