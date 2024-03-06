import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";

export type InfiniteResourceQueryFunction<PageT, FiltersT> = (
  filters: FiltersT,
  context: QueryFunctionContext,
) => PageT | Promise<PageT>;

export type InfiniteResourceQueryHookOptions<PageT> = Omit<
  UseInfiniteQueryOptions<PageT>,
  "queryFn" | "queryKey"
>;

export type InfiniteResourceQueryHook<PageT, FiltersT> = (
  filters: FiltersT,
  options?: Omit<
    InfiniteResourceQueryHookOptions<PageT>,
    "getNextPageParam" | "initialPageParam"
  >,
) => UseInfiniteQueryResult<PageT>;

export interface CreateInfiniteResourceQueryOptions<ResourceT, PageT>
  extends InfiniteResourceQueryHookOptions<PageT> {
  persistResources?: boolean;
  getItems?: (page: PageT) => ResourceT[];
}

export const createInfiniteResourceQuery = <ResourceT, PageT, FiltersT>(
  adapter: QueryAdapter<ResourceT>,
  queryFn: InfiniteResourceQueryFunction<PageT, FiltersT>,
  defaultOptions: CreateInfiniteResourceQueryOptions<ResourceT, PageT>,
): InfiniteResourceQueryHook<PageT, FiltersT> => {
  const { persistResources, getItems, ...hookDefaultOptions } = defaultOptions;
  return (filters, options = {}) => {
    return useInfiniteQuery({
      ...hookDefaultOptions,
      ...options,
      queryFn: async (context) => {
        const data = await queryFn(filters, context);
        if (persistResources && getItems) {
          adapter.setResourceListCache(getItems(data));
        }
        return data;
      },
      queryKey: adapter.getResourceListKey(filters),
    });
  };
};
