import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";

export type InfiniteResourceQueryFunction<PageT, FiltersT, PageParamT> = (
  page: PageParamT,
  filters?: FiltersT,
) => PageT | Promise<PageT>;

export type InfiniteResourceQueryHookOptions<PageT> = Omit<
  UseInfiniteQueryOptions<PageT, DefaultError, InfiniteData<PageT>>,
  "queryFn" | "queryKey"
>;

export type InfiniteResourceQueryHook<PageT, FiltersT> = (
  filters: FiltersT,
  options?: Omit<
    InfiniteResourceQueryHookOptions<PageT>,
    "getNextPageParam" | "initialPageParam"
  >,
) => UseInfiniteQueryResult<InfiniteData<PageT>>;

export interface CreateInfiniteResourceQueryOptions<ResourceT, PageT>
  extends InfiniteResourceQueryHookOptions<PageT> {
  persistResources?: boolean;
  getItems?: (page: PageT) => ResourceT[];
}

export const createInfiniteResourceQuery = <
  ResourceT,
  IdT,
  PageT,
  FiltersT,
  PageParamT,
>(
  adapter: QueryAdapter<ResourceT, IdT>,
  queryFn: InfiniteResourceQueryFunction<PageT, FiltersT, PageParamT>,
  defaultOptions: CreateInfiniteResourceQueryOptions<ResourceT, PageT>,
): InfiniteResourceQueryHook<PageT, FiltersT> => {
  const { persistResources, getItems, ...hookDefaultOptions } = defaultOptions;
  return (filters, options = {}) => {
    return useInfiniteQuery({
      ...hookDefaultOptions,
      ...options,
      queryFn: async ({ pageParam }) => {
        const data = await queryFn(pageParam as PageParamT, filters);
        if (persistResources && getItems) {
          adapter.setResourceListCache(getItems(data));
        }
        return data;
      },
      queryKey: adapter.getResourceListKey(filters),
    });
  };
};
