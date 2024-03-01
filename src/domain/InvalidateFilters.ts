import { InvalidateQueryFilters } from "@tanstack/react-query";

export type InvalidateFilters = Omit<
  InvalidateQueryFilters,
  "queryKey" | "predicate"
>;
