import { QueryAdapter, QueryKeyPart } from "../domain";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

export interface CreateQueryAdapterOptions<T, IdT> {
  getId?: (resource: T) => IdT;
  listKey?: QueryKeyPart;
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
  const { getId = (r) => (r as any)["id"] as IdT, listKey = "_list" } = options;

  const result: CreateQueryAdapterResult<ResourceT, IdT> = {
    getKey: (...parts) => {
      return [resourceName, ...parts];
    },
    getResourceKey: (id) => {
      return [resourceName, id];
    },
    getResourceListKey: (filters?: QueryKeyPart) => {
      return [resourceName, listKey, filters];
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
    invalidateLists: async (filters, options) => {
      return await queryClient.invalidateQueries(
        {
          exact: false,
          ...filters,
          queryKey: result.getResourceListKey(),
        },
        options,
      );
    },

    createResourceQuery: (queryFn, options) => {
      return (id) => {
        return useQuery({
          ...options,
          queryFn: (context) => queryFn(context, id),
          queryKey: result.getResourceKey(id),
        });
      };
    },
    createResourceListQuery: (
      queryFn,
      { persistResources = true, ...options } = {},
    ) => {
      return (filters) => {
        return useQuery({
          ...options,
          queryFn: async (context) => {
            const data = await queryFn(context, filters);
            if (persistResources) {
              for (const resource of data) {
                queryClient.setQueryData(
                  result.getResourceKey(getId(resource)),
                  resource,
                );
              }
            }
            return data;
          },
          queryKey: result.getResourceListKey(filters),
        });
      };
    },
    createResourceMutation: (mutationFn, options) => {
      return () => {
        return useMutation({
          ...options,
          mutationFn,
        });
      };
    },
  };

  return result;
};
