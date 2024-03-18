import { QueryAdapter, QueryKeyPart } from "../domain";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Page } from "../domain/Page.ts";

export interface CreateQueryAdapterOptions<T, IdT> {
  getId?: (resource: T) => IdT;
  listKey?: QueryKeyPart;
  infiniteKey?: QueryKeyPart;
}

export type CreateQueryAdapterResult<ResourceT, IdT> = QueryAdapter<
  ResourceT,
  IdT
>;

export const createQueryAdapter = <ResourceT, IdT>(
  queryClient: QueryClient,
  resourceName: string,
  options: CreateQueryAdapterOptions<ResourceT, IdT> = {},
): CreateQueryAdapterResult<ResourceT, IdT> => {
  const {
    getId = (r) => (r as any)["id"] as IdT,
    listKey = "_list",
    infiniteKey = "_infinite",
  } = options;

  const result: CreateQueryAdapterResult<ResourceT, IdT> = {
    getKey: (...parts) => {
      return [resourceName, ...parts];
    },
    getResourceKey: (id) => {
      return [resourceName, id];
    },
    getResourceListKey: (...filters) => {
      if (filters == null) {
        return [resourceName, listKey];
      }
      return [resourceName, listKey, ...filters];
    },
    getResourceInfiniteListKey: (filters) => {
      if (filters == null) {
        return [resourceName, infiniteKey];
      }
      return [resourceName, infiniteKey, filters];
    },

    invalidate: async (filters, options) => {
      await queryClient.invalidateQueries(
        {
          exact: false,
          ...filters,
          queryKey: result.getKey(),
        },
        options,
      );
    },
    invalidateLists: async (filters, invalidateFilters, options) => {
      return await queryClient.invalidateQueries(
        {
          exact: false,
          ...invalidateFilters,
          queryKey: result.getResourceListKey(filters),
        },
        options,
      );
    },
    invalidateInfiniteLists: async (filters, invalidateFilters, options) => {
      return await queryClient.invalidateQueries(
        {
          exact: false,
          ...invalidateFilters,
          queryKey: result.getResourceInfiniteListKey(filters),
        },
        options,
      );
    },

    setResourceCache: (resource: ResourceT) => {
      const id = getId(resource);
      queryClient.setQueryData(result.getResourceKey(id), resource);
      const lists = queryClient.getQueriesData<ResourceT[]>({
        queryKey: result.getResourceListKey(),
        exact: false,
      });
      for (const [key, list] of lists) {
        if (list == null) continue;
        const index = list.findIndex((item) => getId(item) === id);
        if (index < 0) continue;
        const copy = [...list];
        copy[index] = resource;
        queryClient.setQueryData(key, copy);
      }
      const infiniteLists = queryClient.getQueriesData<
        InfiniteData<Page<ResourceT>>
      >({
        queryKey: result.getResourceInfiniteListKey(),
        exact: false,
      });
      for (const [key, data] of infiniteLists) {
        if (data == null) continue;
        let needsChange = false;
        const pages: Page<ResourceT>[] = [];
        for (const page of data.pages) {
          const index = page.items.findIndex((item) => getId(item) === id);
          if (index < 0) {
            pages.push(page);
          } else {
            needsChange = true;
            const copy = [...page.items];
            copy[index] = resource;
            pages.push({
              ...page,
              items: copy,
            });
          }
        }
        if (!needsChange) continue;
        queryClient.setQueryData(key, { ...data, pages });
      }
    },
    setResourceListCache: (resources: ResourceT[]) => {
      for (const resource of resources) {
        queryClient.setQueryData(
          result.getResourceKey(getId(resource)),
          resource,
        );
      }
    },
  };

  return result;
};
