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

export const createResourceMutation = <
  ResourceT,
  DataT extends ResourceT | void,
  ErrorT,
  ParamT,
>(
  adapter: QueryAdapter<ResourceT>,
  mutationFn: ResourceMutationFunction<DataT, ParamT>,
  defaultOptions?: ResourceMutationHookOptions<DataT, ErrorT, ParamT>,
): ResourceMutationHook<DataT, ErrorT, ParamT> => {
  return (options) => {
    return useMutation({
      ...defaultOptions,
      ...options,
      mutationFn,
      onSuccess: (data) => {
        if (data) {
          adapter.setResourceCache(data as ResourceT);
        }
      },
    });
  };
};
