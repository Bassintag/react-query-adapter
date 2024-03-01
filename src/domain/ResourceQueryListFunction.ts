import { QueryFunctionContext } from "@tanstack/react-query";

export type ResourceQueryListFunction<ResourceT, FiltersT> = (
  filters: FiltersT,
  context: QueryFunctionContext,
) => ResourceT[] | Promise<ResourceT[]>;
