import { DefaultError, UseMutationResult } from "@tanstack/react-query";

export type ResourceMutationHook<DataT, ParamT> = () => UseMutationResult<
  DataT,
  DefaultError,
  ParamT
>;
