# Sending Prompts to the AI Orchestrator

This document describes how to integrate your application with the Orchestrator: submit user prompts and (optionally) poll for the generated response.

---

## What the Orchestrator Does

1. **Accepts** a prompt, optional workspace identifier, and optional agent capabilities (web search, URL scraping, browser workflow).
2. **Validates and parses** the prompt via a reasoning model (Phi-4 mini via LM Studio), producing a workflow type, steps, and required tools (e.g. `rag`, `web_search`, `web_scrape`, `browser`). Rejected prompts are failed with a reason.
3. **Retrieves context** from a RAG/knowledge base (AnythingLLM workspace). Optionally creates a dynamic AnythingLLM workspace per query when requested.
4. **Enriches context** with Firecrawl when requested: web search ([Firecrawl Search](https://docs.firecrawl.dev/features/search)), scraping of known URLs ([Firecrawl Scrape](https://docs.firecrawl.dev/features/scrape)), and multistep web agentic workflows ([Firecrawl Browser Sandbox](https://docs.firecrawl.dev/features/browser)).
5. **Generates** a response using that context and your system prompt.
6. **Stores** status, logs, parsed workflow fields, and the final result so you can poll or display them.

You send one HTTP request to create a “workflow”; a worker processes it asynchronously. Use the returned workflow ID to poll for status and result.

---

## Prerequisites

- **Base URL** of the Convex backend (e.g. `https://your-orchestrator.example.com` or `http://192.168.1.10:3220`). When using the Docker stack, the API is at `http://localhost:3220` (or use the host’s hostname/IP and port 3220 when accessing remotely). Get this from the team that runs the Orchestrator.
- **Authentication** (if enabled): an admin key may be required for self-hosted Convex. You will receive it separately.

---

## Create a Workflow (Submit a Prompt)

**Endpoint:** `POST <BASE_URL>/api/mutation`  
**Headers:** `Content-Type: application/json`  
If auth is required: `Authorization: Convex <ADMIN_KEY>`

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | Must be `"workflows:create"`. |
| `args` | object | Yes | See below. |
| `format` | string | Yes | Use `"json"`. |

**`args`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | The user’s question or instruction (sent to RAG and to the final LLM). |
| `systemPrompt` | string | Yes | System/validation instructions (e.g. safety rules, tone). Used for validation and as system context for generation. |
| `workspaceSlug` | string | No | AnythingLLM workspace slug for RAG. If omitted, the Orchestrator uses its default workspace. Use this to route prompts to different knowledge bases. |
| `agentOptions` | object | No | Agent capabilities. `enableWebSearch`: boolean — use Firecrawl Search to add web results to context. `enableBrowserWorkflow`: boolean — use Firecrawl Browser Sandbox for multistep web workflows (navigation, forms). Requires the worker to have `FIRECRAWL_API` set (and `FIRECRAWL_API_KEY` when using Firecrawl cloud). Browser workflow is not supported on self-hosted Firecrawl. |
| `createDynamicWorkspace` | boolean | No | When true, the worker creates a dedicated AnythingLLM workspace for this workflow and uses it for RAG. |
| `urlsToScrape` | string[] | No | URLs to scrape via Firecrawl Scrape; content is added to context. Requires the worker to have `FIRECRAWL_API` set (and `FIRECRAWL_API_KEY` when using Firecrawl cloud). |

**Example request:**

```json
{
  "path": "workflows:create",
  "args": {
    "prompt": "What is our refund policy for orders over $100?",
    "systemPrompt": "You are a helpful support assistant. Only answer from the provided context. Be concise.",
    "workspaceSlug": "support-docs"
  },
  "format": "json"
}
```

**Success response (HTTP 200):**

```json
{
  "status": "success",
  "value": "k97abc123xyz0",
  "logLines": []
}
```

- `value` is the **workflow ID**. Store it to poll for status and result.

**Error response:** The JSON may include `"status": "error"` and an `errorMessage` or similar field. Handle non-200 HTTP status codes as well.

---

## Workflow Lifecycle and Statuses

After creation, the workflow moves through these statuses (you can infer them when polling):

| Status | Meaning |
|--------|--------|
| `pending` | Queued; worker has not started. |
| `validating` | Prompt is being validated. |
| `retrieving_context` | Fetching context from the knowledge base. |
| `generating` | Generating the final response. |
| `completed` | Done. The result is in the workflow document. |
| `failed` | Error. Check `error` and `logs` on the workflow. |
| `cancelled` | Workflow was cancelled. |

---

## Get Workflow Status and Result (Polling)

**Endpoint:** `POST <BASE_URL>/api/query`  
**Headers:** `Content-Type: application/json`  
Same auth as for mutations, if required.

**Request body:**

```json
{
  "path": "workflows:get",
  "args": { "id": "<WORKFLOW_ID>" },
  "format": "json"
}
```

Replace `<WORKFLOW_ID>` with the `value` returned from the create mutation.

**Success response:** A JSON object representing the workflow document, for example:

```json
{
  "prompt": "What is our refund policy...",
  "systemPrompt": "You are a helpful support assistant...",
  "workspaceSlug": "support-docs",
  "status": "completed",
  "result": "For orders over $100, customers can request a full refund within 30 days...",
  "error": null,
  "logs": ["Validating prompt...", "Validation passed.", "Querying knowledge base...", "..."],
  "workflowType": "qa",
  "steps": ["Retrieve context", "Synthesize answer"],
  "toolsRequired": ["rag"],
  "validationResult": { "valid": true },
  "updatedAt": 1709123456789
}
```

**Fields you care about:**

- **`status`** — Use this to know when to stop polling (`completed` or `failed`).
- **`result`** — Present when `status === "completed"`; this is the generated answer.
- **`error`** — Present when `status === "failed"`; short error message.
- **`logs`** — Optional; progress messages for debugging or UI.
- **`workflowType`** — Set after validation (e.g. `qa`, `summarization`, `research`, `code_assist`, `data_gathering`, `general`). Omitted until validation completes.
- **`steps`** — Ordered steps parsed by the validation agent. Omitted until validation completes.
- **`toolsRequired`** — Tools the validation agent determined (e.g. `rag`, `web_search`, `web_scrape`, `browser`, `none`). Omitted until validation completes.
- **`validationResult`** — When validation failed: `{ "valid": false, "rejectionReason": "..." }`. When valid: `{ "valid": true }`.

**Polling strategy:** Poll `workflows:get` every 1–3 seconds until `status` is `completed`, `failed`, or `cancelled`, then read `result` or `error` as appropriate.

**Optional — list workflows:** `POST <BASE_URL>/api/query` with `path: "workflows:listAll"` and `args: {}` returns all workflows (for dashboards or debugging). Response is an array of workflow documents.

**Optional — cancel or retry:** To cancel a running workflow, `POST <BASE_URL>/api/mutation` with `path: "workflows:cancel"` and `args: { "id": "<WORKFLOW_ID>" }`. To retry a failed workflow, use `path: "workflows:retry"` and the same `args`. Both return the updated workflow ID on success.

---

## Example: Create and Poll (curl)

```bash
BASE_URL="https://your-orchestrator.example.com"

# 1) Create workflow
RESP=$(curl -sS -X POST "$BASE_URL/api/mutation" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "workflows:create",
    "args": {
      "prompt": "Summarize our return policy.",
      "systemPrompt": "Answer only from the provided context. Be brief.",
      "workspaceSlug": "policies"
    },
    "format": "json"
  }')

WORKFLOW_ID=$(echo "$RESP" | jq -r '.value')
echo "Workflow ID: $WORKFLOW_ID"

# 2) Poll until completed or failed
while true; do
  STATUS=$(curl -sS -X POST "$BASE_URL/api/query" \
    -H "Content-Type: application/json" \
    -d "{\"path\": \"workflows:get\", \"args\": {\"id\": \"$WORKFLOW_ID\"}, \"format\": \"json\"}" \
    | jq -r '.status')
  echo "Status: $STATUS"
  case "$STATUS" in
    completed) break ;;
    failed)    break ;;
    cancelled) break ;;
  esac
  sleep 2
done

# 3) Fetch final result
curl -sS -X POST "$BASE_URL/api/query" \
  -H "Content-Type: application/json" \
  -d "{\"path\": \"workflows:get\", \"args\": {\"id\": \"$WORKFLOW_ID\"}, \"format\": \"json\"}" \
  | jq '.result, .error'
```

---

## Example: Create and Poll (Python)

```python
import time
import requests

BASE_URL = "https://your-orchestrator.example.com"

def create_workflow(prompt: str, system_prompt: str, workspace_slug: str | None = None) -> str:
    args = {"prompt": prompt, "systemPrompt": system_prompt}
    if workspace_slug:
        args["workspaceSlug"] = workspace_slug
    r = requests.post(
        f"{BASE_URL}/api/mutation",
        json={"path": "workflows:create", "args": args, "format": "json"},
        headers={"Content-Type": "application/json"},
    )
    r.raise_for_status()
    data = r.json()
    if data.get("status") != "success":
        raise RuntimeError(data.get("errorMessage", data))
    return data["value"]

def get_workflow(workflow_id: str) -> dict:
    r = requests.post(
        f"{BASE_URL}/api/query",
        json={"path": "workflows:get", "args": {"id": workflow_id}, "format": "json"},
        headers={"Content-Type": "application/json"},
    )
    r.raise_for_status()
    return r.json()

def run_prompt(prompt: str, system_prompt: str, workspace_slug: str | None = None, poll_interval: float = 2.0):
    workflow_id = create_workflow(prompt, system_prompt, workspace_slug)
    while True:
        wf = get_workflow(workflow_id)
        status = wf.get("status")
        if status in ("completed", "failed", "cancelled"):
            return wf.get("result"), wf.get("error"), status
        time.sleep(poll_interval)

# Usage
result, error, status = run_prompt(
    "What is the refund window?",
    "Answer only from context. Be concise.",
    workspace_slug="support-docs",
)
if status == "completed":
    print(result)
else:
    print("Error:", error)
```

---

## Workspace slug (routing to different knowledge bases)

- The Orchestrator can use multiple AnythingLLM workspaces (e.g. “support-docs”, “internal-policies”, “default”).
- Pass **`workspaceSlug`** in `args` when creating a workflow to choose which workspace is used for RAG for that prompt.
- If you omit **`workspaceSlug`**, the Orchestrator uses its configured default workspace.
- Set **`createDynamicWorkspace`** to `true` to have the worker create a dedicated AnythingLLM workspace for that workflow (no pre-existing slug needed).
- Valid slug values and their meanings are defined by the team that runs the Orchestrator; ask them for the list.

---

## Firecrawl (web search, scrape, browser workflow)

Web-related capabilities use [Firecrawl](https://docs.firecrawl.dev/introduction). The worker must have **`FIRECRAWL_API`** set (and **`FIRECRAWL_API_KEY`** when using Firecrawl cloud); otherwise `enableWebSearch`, `urlsToScrape`, and `enableBrowserWorkflow` are skipped (and the worker may log that Firecrawl is not configured).

- **Web search:** `agentOptions.enableWebSearch: true` uses Firecrawl Search to add web results to context. See [Firecrawl Search](https://docs.firecrawl.dev/features/search).
- **URL scraping:** `urlsToScrape: ["https://...", ...]` uses Firecrawl Scrape to fetch markdown from each URL and add it to context. See [Firecrawl Scrape](https://docs.firecrawl.dev/features/scrape).
- **Browser workflow:** `agentOptions.enableBrowserWorkflow: true` (or the validation agent setting `toolsRequired` including `browser`) uses the Firecrawl Browser Sandbox for multistep web agentic workflows (e.g. navigation, forms). See [Firecrawl Browser](https://docs.firecrawl.dev/features/browser).

### Self-hosted Firecrawl

You can point the worker at a [self-hosted Firecrawl](https://docs.firecrawl.dev/contributing/self-host) instance by setting **`FIRECRAWL_API`** to your instance base URL (e.g. `http://firecrawl-api:3002/v2` when using the unified Docker stack, or `http://localhost:3002/v2` when the worker runs on the host). An API key is **optional** for self-hosted. **Search** and **scrape** are supported; **browser workflow** is not supported in self-hosted Firecrawl and will be skipped with a log message. When using the Docker stack, the worker defaults to the in-stack Firecrawl API; no API key is required for that setup.

---

## Checklist for Your Integration

1. Obtain **base URL** and **admin key** (if required) from the Orchestrator team. For the Docker stack, the API is at `http://<host>:3220`.
2. **Create workflow:** `POST /api/mutation` with `path: "workflows:create"` and `args: { prompt, systemPrompt, workspaceSlug?, agentOptions?, createDynamicWorkspace?, urlsToScrape? }`.
3. Store the returned **workflow ID** (`value`).
4. **Poll:** `POST /api/query` with `path: "workflows:get"` and `args: { id: "<workflow_id>" }` until `status` is `completed`, `failed`, or `cancelled`.
5. Read **`result`** on success or **`error`** on failure from the workflow document. Use **`workflowType`**, **`steps`**, **`toolsRequired`**, and **`validationResult`** when present for richer UI or logic.
6. (Optional) Use **`workflows:listAll`** to list workflows, **`workflows:cancel`** to cancel a running workflow, or **`workflows:retry`** to retry a failed one.
