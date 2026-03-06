import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "orchestrator-docs-sync",
  { hours: 6 },
  internal.orchestratorDocsSync.fetchAndStoreOrchestratorDocsInternal
);

export default crons;
