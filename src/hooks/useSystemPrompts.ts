import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useSystemPrompts() {
  return useQuery(api.systemPrompts.list);
}
