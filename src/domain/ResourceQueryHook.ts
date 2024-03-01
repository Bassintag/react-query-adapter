import { UseQueryResult } from "@tanstack/react-query";

export type ResourceQueryHook<ResourceT, IdT> = (
  id: IdT,
) => UseQueryResult<ResourceT>;
