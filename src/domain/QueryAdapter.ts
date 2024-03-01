import {
  DefaultError,
  InvalidateOptions,
  MutationFunction,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import { QueryKeyPart } from "./QueryKeyPart.ts";
import { InvalidateFilters } from "./InvalidateFilters.ts";
import { ResourceQueryHook } from "./ResourceQueryHook.ts";
import { ResourceQueryFunction } from "./ResourceQueryFunction.ts";
import { ResourceQueryListFunction } from "./ResourceQueryListFunction.ts";
import { ResourceQueryListHook } from "./ResourceQueryListHook.ts";
import { ResourceMutationHook } from "./ResourceMutationHook.ts";
import type { UseMutationOptions } from "@tanstack/react-query";

export interface CreateResourceQueryOptions<ResourceT>
  extends Omit<UseQueryOptions<ResourceT>, "queryFn" | "queryKey"> {}

export interface CreateResourceListQueryOptions<ResourceT>
  extends Omit<UseQueryOptions<ResourceT[]>, "queryFn" | "queryKey"> {
  persistResources?: boolean;
}

export interface QueryAdapter<ResourceT, IdT> {
  getKey: (...parts: QueryKeyPart[]) => QueryKey;
  getResourceKey: (id: IdT) => QueryKey;
  getResourceListKey: (filters?: QueryKeyPart) => QueryKey;

  invalidate: (
    filters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  invalidateLists: (
    filters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;

  createResourceQuery: (
    queryFn: ResourceQueryFunction<ResourceT, IdT>,
    options?: CreateResourceQueryOptions<ResourceT>,
  ) => ResourceQueryHook<ResourceT, IdT>;
  createResourceListQuery: <FiltersT>(
    queryFn: ResourceQueryListFunction<ResourceT, FiltersT>,
    options?: CreateResourceListQueryOptions<ResourceT>,
  ) => ResourceQueryListHook<ResourceT, FiltersT>;
  createResourceMutation: <
    DataT extends ResourceT | ResourceT[] | void,
    ParamT,
  >(
    mutationFn: MutationFunction<DataT, ParamT>,
    options?: UseMutationOptions<DataT, DefaultError, ParamT>,
  ) => ResourceMutationHook<DataT, ParamT>;
}
