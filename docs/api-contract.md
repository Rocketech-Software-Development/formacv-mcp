# HTTP API contract — FormaCV backend

Every tool exposed by **`@formacv/mcp`** ultimately talks to **your isolated FormaCV HTTPS endpoint** (`FORMACV_SERVER_URL`). Implement the routes below server-side—or treat this document as the canonical contract FormaCV already satisfies in production—to become a drop-in replacement for [**demo**](https://demo.formacv.ai) mode while developing **AI agents**.

## Base URL & versioning

All paths are prefixed with `/v1`. Example base: `https://your-tenant.formacv.ai`.

## Authentication

Include the tenant API token on **every request**:

```
Authorization: Bearer <FORMACV_API_KEY>
```

Optional compatibility header (ignored if duplicate):

```
X-FormaCV-Key: <FORMACV_API_KEY>
```

## Content type

Unless noted, requests and responses use `application/json; charset=utf-8`.

Binary payloads referenced in tools should be transported as Base64 inside JSON (`content_base64`) or via signed URLs exchanged in async `result` objects—depending on tenant hardening. The MCP layer mirrors whatever your instance advertises.

## Error envelope

Failed requests return a JSON body shaped as:

```json
{
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "template_id tmpl_missing does not exist",
    "status": 404
  }
}
```

| HTTP | Typical `code` | Meaning |
|---:|---|---|
| 400 | `INVALID_ARGUMENT` | Schema validation failed |
| 401 | `UNAUTHENTICATED` | Missing/invalid bearer token |
| 403 | `PERMISSION_DENIED` | Token valid but lacks scope |
| 404 | `NOT_FOUND` | Template, integration, job, or candidate unavailable |
| 409 | `CONFLICT` | Optimistic concurrency / duplicate push |
| 429 | `RESOURCE_EXHAUSTED` | Rate limit or queue saturation |
| 500 | `INTERNAL` | Unexpected server fault |
| 503 | `UNAVAILABLE` | Planned maintenance |

## Idempotency

Mutating endpoints accept an optional header:

```
Idempotency-Key: <uuid>
```

When provided, duplicate submissions with the same key should replay the original response rather than enqueueing duplicate jobs.

---

## POST `/v1/format_cv`

**Purpose:** Produce a branded render of a CV.

### Request body

| Field | Type | Required |
|---|---|---:|
| `cv` | `string` | yes |
| `template_id` | `string` | yes |
| `options` | `object` | no |

### Response `200 OK`

```json
{
  "job_id": "job_fmt_8f3c2a",
  "status": "completed",
  "formatted_cv": "%PDF… or HTML…",
  "format": "pdf",
  "warnings": []
}
```

When only async processing occurs, omit `formatted_cv` and return `status: "queued"` with `job_id`.

---

## POST `/v1/tailor_cv`

**Purpose:** Tailor CV content against a vacancy with AI instructions.

### Request body

| Field | Type | Required |
|---|---|---:|
| `cv` | `string` | yes |
| `vacancy_description` | `string` | yes |
| `instructions` | `string` | no |
| `template_id` | `string` | no |
| `options` | `object` | no |

### Response `200 OK`

```json
{
  "job_id": "job_tail_991bba",
  "status": "processing",
  "tailored_cv": null,
  "highlights": []
}
```

Populate `tailored_cv` when synchronous completions are permitted.

---

## POST `/v1/anonymize_cv`

**Purpose:** Strip PII and emit an immutable audit ledger.

### Request body

| Field | Type | Required |
|---|---|---:|
| `cv` | `string` | yes |
| `rules` | `object` | no |
| `template_id` | `string` | no |

### Response `200 OK`

```json
{
  "job_id": null,
  "status": "completed",
  "anonymized_cv": "Candidate REF-…",
  "audit_log": []
}
```

---

## POST `/v1/push_to_ats`

**Purpose:** Upload formatted artefacts back to Bullhorn, JobAdder, or Vincere.

### Request body

| Field | Type | Required |
|---|---|---:|
| `ats_provider` | `string` | yes |
| `candidate_id` | `string` | yes |
| `document` | `object` | yes |
| `integration_id` | `string` | no |
| `metadata` | `object` | no |

### Response `200 OK`

```json
{
  "job_id": "job_push_441ac1",
  "status": "completed",
  "attachment_id": "bh_att_88421"
}
```

---

## POST `/v1/bulk_format`

**Purpose:** Batch-format many CVs with shared options.

### Request body

| Field | Type | Required |
|---|---|---:|
| `items` | `array` | yes |
| `template_id` | `string` | yes |
| `options` | `object` | no |

### Response `200 OK`

```json
{
  "job_id": "job_blk_7712aa",
  "status": "queued",
  "summary": {
    "submitted": 50,
    "failed": 0
  },
  "results": []
}
```

---

## POST `/v1/list_templates`

**Purpose:** Page through available templates.

### Request body

| Field | Type | Required |
|---|---|---:|
| `filters` | `object` | no |
| `page` | `number` | no |
| `page_size` | `number` | no |

### Response `200 OK`

```json
{
  "templates": [],
  "next_page": null
}
```

---

## POST `/v1/list_integrations`

**Purpose:** List configured ATS integrations.

### Request body

| Field | Type | Required |
|---|---|---:|
| `include_health` | `boolean` | no |

### Response `200 OK`

```json
{
  "integrations": []
}
```

---

## POST `/v1/get_job_status`

**Purpose:** Retrieve async job completion payloads.

### Request body

| Field | Type | Required |
|---|---|---:|
| `job_id` | `string` | yes |

### Response `200 OK`

```json
{
  "job_id": "job_fmt_8f3c2a",
  "status": "completed",
  "progress": { "percent": 100, "step": "deliver" },
  "result": {
    "formatted_cv": "",
    "format": "pdf"
  },
  "error": null
}
```

---

## Webhooks (optional extension)

Deployments may optionally emit webhook callbacks (`job.completed`, `bulk.item_failed`) with HMAC-signed bodies. MCP clients continue to rely on `get_job_status` unless webhook fan-out is enabled for your tenant.

## Compliance & auditing

Responses that transform personal data SHOULD include correlatable `request_id` headers (`X-Request-Id`) to tie recruiter actions across ATS audit trails.

---

Need SDK-less testing first? Configure [`demo-mode.md`](demo-mode.md) credentials so front-end engineers can validate parsers before production keys arrive.
