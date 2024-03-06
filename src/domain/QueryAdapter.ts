import {
  InvalidateOptions,
  QueryKey,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { QueryKeyPart } from "./QueryKeyPart.ts";
import { InvalidateFilters } from "./InvalidateFilters.ts";

export interface CreateResourcePageQueryOptions<PageT>
  extends Omit<UseInfiniteQueryOptions<PageT>, "queryFn" | "queryKey"> {
  persistResources?: boolean;
}

export interface QueryAdapter<ResourceT, IdT = QueryKeyPart> {
  getKey: (...parts: QueryKeyPart[]) => QueryKey;
  getResourceKey: (id: IdT) => QueryKey;
  getResourceListKey: (filters?: QueryKeyPart) => QueryKey;
  getResourcePageKey: (filters?: QueryKeyPart) => QueryKey;

  invalidate: (
    filters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  invalidateLists: (
    filters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;

  setResourceCache: (resource: ResourceT) => void;
  setResourceListCache: (resources: ResourceT[]) => void;
}
