import { QueryAdapter, QueryKeyPart } from "../domain";
import { QueryClient } from "@tanstack/react-query";

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
        return [resourceName, listKey];
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
      queryClient.setQueryData(
        result.getResourceKey(getId(resource)),
        resource,
      );
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
