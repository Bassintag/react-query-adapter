import { InvalidateOptions, QueryKey } from "@tanstack/react-query";
import { QueryKeyPart } from "./QueryKeyPart.ts";
import { InvalidateFilters } from "./InvalidateFilters.ts";

export interface QueryAdapter<ResourceT, IdT> {
  getKey: (...parts: QueryKeyPart[]) => QueryKey;
  getResourceKey: (id: IdT) => QueryKey;
  getResourceListKey: (filters?: QueryKeyPart) => QueryKey;
  getResourceInfiniteListKey: (filters?: QueryKeyPart) => QueryKey;

  invalidate: (
    invalidateFilters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  invalidateLists: (
    filters?: QueryKeyPart,
    invalidateFilters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;
  invalidateInfiniteLists: (
    filters?: QueryKeyPart,
    invalidateFilters?: InvalidateFilters,
    options?: InvalidateOptions,
  ) => Promise<void>;

  setResourceCache: (resource: ResourceT) => void;
  setResourceListCache: (resources: ResourceT[]) => void;
}
