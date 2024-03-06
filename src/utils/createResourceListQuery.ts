import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";

export type ResourceListQueryFunction<ResourceT, FiltersT> = (
  filters?: FiltersT,
) => ResourceT[] | Promise<ResourceT[]>;

export type ResourceListQueryHookOptions<ResourceT> = Omit<
  UseQueryOptions<ResourceT[]>,
  "queryFn" | "queryKey"
>;

export type ResourceListQueryHook<ResourceT, FiltersT> = (
  filters: FiltersT,
  options?: ResourceListQueryHookOptions<ResourceT>,
) => UseQueryResult<ResourceT[]>;

export interface CreateResourceListQueryOptions<ResourceT>
  extends ResourceListQueryHookOptions<ResourceT> {
  persistResources?: boolean;
}

export const createResourceListQuery = <ResourceT, IdT, FiltersT>(
  adapter: QueryAdapter<ResourceT, IdT>,
  queryFn: ResourceListQueryFunction<ResourceT, FiltersT>,
  defaultOptions: CreateResourceListQueryOptions<ResourceT> = {},
): ResourceListQueryHook<ResourceT, FiltersT> => {
  const { persistResources, ...hookDefaultOptions } = defaultOptions;
  return (filters, options = {}) => {
    return useQuery({
      ...hookDefaultOptions,
      ...options,
      queryFn: async () => {
        const data = await queryFn(filters);
        if (persistResources) {
          adapter.setResourceListCache(data);
        }
        return data;
      },
      queryKey: adapter.getResourceListKey(filters),
    });
  };
};
