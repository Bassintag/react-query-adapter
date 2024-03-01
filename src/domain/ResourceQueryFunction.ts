import { QueryFunctionContext } from "@tanstack/react-query";

export type ResourceQueryFunction<ResourceT, IdT> = (
  context: QueryFunctionContext,
  id: IdT,
) => ResourceT | Promise<ResourceT>;
