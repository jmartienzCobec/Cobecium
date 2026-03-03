# Sending Prompts to the AI Orchestrator

This document describes how to integrate your application with the Orchestrator: submit user prompts and (optionally) poll for the generated response.

---

## What the Orchestrator Does

1. **Accepts** a prompt and an optional workspace identifier.
2. **Validates** the prompt (via an LLM guard).
3. **Retrieves context** from a RAG/knowledge base (AnythingLLM workspace).
4. **Generates** a response using that context and your system prompt.
5. **Stores** status, logs, and the final result so you can poll or display them.

You send one HTTP request to create a “workflow”; a worker processes it asynchronously. Use the returned workflow ID to poll for status and result.

---

## Prerequisites

- **Base URL** of the Convex backend (e.g. `https://your-orchestrator.example.com` or `http://192.168.1.10:3220`). Get this from the team that runs the Orchestrator.
- **Authentication** (if enabled): an admin key may be required. You will receive it separately.

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
  "updatedAt": 1709123456789
}
```

**Fields you care about:**

- **`status`** — Use this to know when to stop polling (`completed` or `failed`).
- **`result`** — Present when `status === "completed"`; this is the generated answer.
- **`error`** — Present when `status === "failed"`; short error message.
- **`logs`** — Optional; progress messages for debugging or UI.

**Polling strategy:** Poll `workflows:get` every 1–3 seconds until `status` is `completed`, `failed`, or `cancelled`, then read `result` or `error` as appropriate.

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
- Valid slug values and their meanings are defined by the team that runs the Orchestrator; ask them for the list.

---

## Checklist for Your Integration

1. Obtain **base URL** and **admin key** (if required) from the Orchestrator team.
2. **Create workflow:** `POST /api/mutation` with `path: "workflows:create"` and `args: { prompt, systemPrompt, workspaceSlug? }`.
3. Store the returned **workflow ID** (`value`).
4. **Poll:** `POST /api/query` with `path: "workflows:get"` and `args: { id: "<workflow_id>" }` until `status` is `completed`, `failed`, or `cancelled`.
5. Read **`result`** on success or **`error`** on failure from the workflow document.
