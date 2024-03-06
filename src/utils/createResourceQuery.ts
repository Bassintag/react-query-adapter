import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";

export type ResourceQueryFunction<ResourceT, IdT> = (
  id: IdT,
) => ResourceT | Promise<ResourceT>;

export type ResourceQueryHookOptions<ResourceT> = Omit<
  UseQueryOptions<ResourceT>,
  "queryFn" | "queryKey"
>;

export type ResourceQueryHook<ResourceT, IdT> = (
  id: IdT,
  options?: ResourceQueryHookOptions<ResourceT>,
) => UseQueryResult<ResourceT>;

export type CreateResourceQueryOptions<ResourceT> =
  ResourceQueryHookOptions<ResourceT>;

export const createResourceQuery = <ResourceT, IdT>(
  adapter: QueryAdapter<ResourceT, IdT>,
  queryFn: ResourceQueryFunction<ResourceT, any>,
  defaultOptions?: CreateResourceQueryOptions<ResourceT>,
): ResourceQueryHook<ResourceT, IdT> => {
  return (id, options) => {
    return useQuery({
      ...defaultOptions,
      ...options,
      queryFn: () => queryFn(id),
      queryKey: adapter.getResourceKey(id),
    });
  };
};
