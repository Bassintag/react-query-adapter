import { QueryFunctionContext } from "@tanstack/react-query";

export type ResourceQueryFunction<ResourceT, IdT> = (
  id: IdT,
  context: QueryFunctionContext,
) => ResourceT | Promise<ResourceT>;
