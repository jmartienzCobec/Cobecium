import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useProcurementLinks() {
  return useQuery(api.procurementLinks.list);
}
