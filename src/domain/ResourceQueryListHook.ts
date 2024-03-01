import { UseQueryResult } from "@tanstack/react-query";

export type ResourceQueryListHook<ResourceT, FiltersT> = (
  filters: FiltersT,
) => UseQueryResult<ResourceT[]>;
