import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { QueryAdapter } from "../domain";
import { Page } from "../domain/Page.ts";

export type InfiniteResourceQueryFunction<PageT, FiltersT, PageParamT> = (
  page: PageParamT,
  filters?: FiltersT,
) => PageT | Promise<PageT>;

export type InfiniteResourceQueryHookOptions<PageT> = Omit<
  UseInfiniteQueryOptions<PageT, DefaultError, InfiniteData<PageT>>,
  "queryFn" | "queryKey"
>;

export type InfiniteResourceQueryHook<PageT, FiltersT> = (
  filters?: FiltersT,
  options?: Omit<
    InfiniteResourceQueryHookOptions<PageT>,
    "getNextPageParam" | "initialPageParam"
  >,
) => UseInfiniteQueryResult<InfiniteData<PageT>>;

export interface CreateInfiniteResourceQueryOptions<PageT>
  extends InfiniteResourceQueryHookOptions<PageT> {
  persistResources?: boolean;
}

export const createInfiniteResourceQuery = <
  ResourceT,
  IdT,
  PageT extends Page<ResourceT>,
  FiltersT,
  PageParamT,
>(
  adapter: QueryAdapter<ResourceT, IdT>,
  queryFn: InfiniteResourceQueryFunction<PageT, FiltersT, PageParamT>,
  defaultOptions: CreateInfiniteResourceQueryOptions<PageT>,
): InfiniteResourceQueryHook<PageT, FiltersT> => {
  const { persistResources = true, ...hookDefaultOptions } = defaultOptions;
  return (filters, options = {}) => {
    return useInfiniteQuery({
      ...hookDefaultOptions,
      ...options,
      queryFn: async ({ pageParam }) => {
        const data = await queryFn(pageParam as PageParamT, filters);
        if (persistResources) {
          adapter.setResourceListCache(data.items);
        }
        return data;
      },
      queryKey: adapter.getResourceInfiniteListKey(filters),
    });
  };
};
