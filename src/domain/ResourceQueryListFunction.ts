import { QueryFunctionContext } from "@tanstack/react-query";

export type ResourceQueryListFunction<ResourceT, FiltersT> = (
  context: QueryFunctionContext,
  filters?: FiltersT,
) => ResourceT[] | Promise<ResourceT[]>;
