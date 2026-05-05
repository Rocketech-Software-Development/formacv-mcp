# Tool reference — `@formacv/mcp`

This page documents the **eight tools** exposed by the official FormaCV Model Context Protocol (MCP) server. Each tool maps to the same contract your isolated FormaCV HTTP API implements in production; see [`api-contract.md`](api-contract.md).

Conventions:

- **Types** use JSON-friendly names (`string`, `number`, `boolean`, `object`, `array`, `enum`).
- **Required** means the field must be present (empty strings may still be rejected by the server).
- Async tools return a `job_id` when work continues in the background; poll with `get_job_status`.

---

## `format_cv`

**Description:** Format a candidate CV or resume into your agency **branded CV** layout using `template_id`, with optional layout and export settings. Built for daily **resume formatting** in **recruitment automation** workflows tied to Bullhorn, JobAdder, or Vincere.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `cv` | `string` | yes | Raw CV content (plaintext, Markdown, or HTML fragments depending on tenant configuration). |
| `template_id` | `string` | yes | Template identifier (for example `tmpl_acme_standard`). |
| `options` | `object` | no | Rendering options (`output_format`: `pdf` \| `docx` \| `html`, `locale`, `strict_ats_safe`, metadata passthrough). |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `job_id` | `string` | Present when formatting is queued asynchronously. |
| `status` | `string` | `completed`, `queued`, `processing`, or `failed`. |
| `formatted_cv` | `string` | Rendered CV body when `status` is `completed` synchronously or included inline. |
| `format` | `string` | Echo of rendered MIME or logical format (`pdf`, `docx`, `html`). |
| `warnings` | `array` | Optional parser warnings (non-fatal). |

### Example call

```json
{
  "name": "format_cv",
  "arguments": {
    "cv": "Jane Doe\\nSenior Recruiter\\n…",
    "template_id": "tmpl_acme_standard",
    "options": { "output_format": "pdf", "locale": "en-GB" }
  }
}
```

### Example response

```json
{
  "job_id": "job_fmt_8f3c2a",
  "status": "completed",
  "formatted_cv": "%PDF-1.7…",
  "format": "pdf"
}
```

---

## `tailor_cv`

**Description:** **AI CV formatting** that **tailor**s a CV against a live vacancy: bold keyword matches, translate sections, and demote irrelevant experience—ideal for **AI recruiting** copilots and **recruitment AI** assistants.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `cv` | `string` | yes | Source CV text before tailoring. |
| `vacancy_description` | `string` | yes | Job description, advert text, or internal brief. |
| `instructions` | `string` | no | Free-text recruiter instructions (“emphasise leadership”, “tone down academia”). |
| `template_id` | `string` | no | Apply tailoring on top of a specific branded template pipeline. |
| `options` | `object` | no | `{ "languages": ["en","de"], "bold_matches": true, "demote_irrelevant": true }`. |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `job_id` | `string` | Async tailoring jobs. |
| `status` | `string` | Job lifecycle flag. |
| `tailored_cv` | `string` | Fully tailored document when completed. |
| `highlights` | `array` | Optional structured list of changes (section, rationale). |

### Example call

```json
{
  "name": "tailor_cv",
  "arguments": {
    "cv": "…”,
    "vacancy_description": "Senior DevOps Engineer, Kubernetes required…",
    "instructions": "Bold matches with the vacancy; translate German employers to English.",
    "options": { "bold_matches": true }
  }
}
```

### Example response

```json
{
  "job_id": "job_tail_991bba",
  "status": "processing"
}
```

---

## `anonymize_cv`

**Description:** Produce a **GDPR-compliant** **blind submission** packet by stripping PII (name, photo placeholders, postal address, telephone, email) while retaining searchable skills. Includes an **audit log** for compliance reviews—see product positioning on **[CV anonymization](https://formacv.ai/features/anonymization)**.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `cv` | `string` | yes | Candidate CV prior to anonymization. |
| `rules` | `object` | no | Fine-grained toggles (`strip_photo`, `mask_employers`, `retain_current_role_title`). |
| `template_id` | `string` | no | Render anonymized output using a compliance template. |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `job_id` | `string` | Optional async identifier. |
| `status` | `string` | Processing state. |
| `anonymized_cv` | `string` | Redacted CV ready for client review. |
| `audit_log` | `array` | Each entry notes field removed/transformed plus timestamp. |

### Example call

```json
{
  "name": "anonymize_cv",
  "arguments": {
    "cv": "John Smith … john@example.com …",
    "rules": { "strip_photo": true, "mask_employers": false }
  }
}
```

### Example response

```json
{
  "status": "completed",
  "anonymized_cv": "Candidate REF-9821 …",
  "audit_log": [
    { "field": "email", "action": "redact", "at": "2026-05-05T14:02:01Z" }
  ]
}
```

---

## `push_to_ats`

**Description:** After formatting or tailoring, push the artefact back into your ATS candidate record (**Bullhorn**, **JobAdder**, or **Vincere**) as part of an end-to-end **ATS integration**.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `ats_provider` | `enum` | yes | One of `bullhorn`, `jobadder`, `vincere`. |
| `candidate_id` | `string` | yes | Native candidate identifier in the ATS. |
| `document` | `object` | yes | Payload containing binary/base64/file reference per tenant rules. |
| `document.filename` | `string` | yes | Desired filename (`Acme_Placement_JDoe.docx`). |
| `document.content_base64` | `string` | conditional | Base64 document bytes when inline upload is enabled. |
| `integration_id` | `string` | no | Disambiguates multi-tenant connector profiles. |
| `metadata` | `object` | no | Audit tags (job_id, recruiter_id). |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `status` | `string` | `completed`, `queued`, `failed`. |
| `attachment_id` | `string` | ATS-native attachment/file id when available. |
| `job_id` | `string` | Async push operations. |

### Example call

```json
{
  "name": "push_to_ats",
  "arguments": {
    "ats_provider": "bullhorn",
    "candidate_id": "12345",
    "document": {
      "filename": "Candidate_12345_FormaCV.pdf",
      "content_base64": "JVBERi0xLjQK…"
    }
  }
}
```

### Example response

```json
{
  "status": "completed",
  "attachment_id": "bh_att_88421"
}
```

---

## `bulk_format`

**Description:** Batch **AI CV formatting** for search-result workflows (up to your plan limits—commonly tens of profiles per invocation). Ideal for recruiters cleaning **candidate parsing** backlogs before client delivery.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `items` | `array` | yes | Each element `{ "id": "crm-123", "cv": "…", "notes": "" }`. |
| `template_id` | `string` | yes | Applied to every successful item unless overridden per row. |
| `options` | `object` | no | Shared render options (`output_format`, throttling hints). |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `job_id` | `string` | Bulk jobs are usually asynchronous. |
| `status` | `string` | Overall bulk state. |
| `summary` | `object` | Counts `{ "submitted": 12, "failed": 1 }`. |
| `results` | `array` | Optional inline preview for synchronous subsets. |

### Example call

```json
{
  "name": "bulk_format",
  "arguments": {
    "template_id": "tmpl_acme_bulk",
    "items": [
      { "id": "cand_501", "cv": "…" },
      { "id": "cand_502", "cv": "…" }
    ]
  }
}
```

### Example response

```json
{
  "job_id": "job_blk_7712aa",
  "status": "queued",
  "summary": { "submitted": 2, "failed": 0 }
}
```

---

## `list_templates`

**Description:** Discover **branded CV** templates (per client, branch, user, or compliance pack) so an **AI agent** can pick the right layout before calling `format_cv`.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `filters` | `object` | no | `{ "client_id", "branch_id", "tag", "locale" }` — all optional. |
| `page` | `number` | no | 1-based page index. |
| `page_size` | `number` | no | Max rows (server-enforced ceiling). |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `templates` | `array` | `{ "id", "name", "description", "tags", "locales" }`. |
| `next_page` | `number` | Present when additional pages remain. |

### Example call

```json
{
  "name": "list_templates",
  "arguments": {
    "filters": { "tag": "finance_compliance" },
    "page": 1
  }
}
```

### Example response

```json
{
  "templates": [
    {
      "id": "tmpl_acme_standard",
      "name": "ACME Executive",
      "tags": ["EMEA", "compliance"],
      "locales": ["en-GB", "de-DE"]
    }
  ]
}
```

---

## `list_integrations`

**Description:** Enumerate active ATS connectors configured for your tenant—useful guardrails before `push_to_ats`.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `include_health` | `boolean` | no | When true, returns last heartbeat / OAuth expiry metadata. |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `integrations` | `array` | `{ "id", "provider", "label", "status", "regions" }`. |

### Example call

```json
{
  "name": "list_integrations",
  "arguments": {
    "include_health": true
  }
}
```

### Example response

```json
{
  "integrations": [
    {
      "id": "int_bh_prod",
      "provider": "bullhorn",
      "label": "Bullhorn — Production",
      "status": "connected"
    }
  ]
}
```

---

## `get_job_status`

**Description:** Poll asynchronous jobs emitted by `format_cv`, `tailor_cv`, `anonymize_cv`, `bulk_format`, or `push_to_ats`.

### INPUT

| Field | Type | Required | Description |
|---|---|---:|---|
| `job_id` | `string` | yes | Identifier returned by a mutating tool. |

### OUTPUT

| Field | Type | Description |
|---|---|---|
| `job_id` | `string` | Echo identifier. |
| `status` | `string` | `queued`, `processing`, `completed`, `failed`. |
| `progress` | `object` | Optional `{ "percent": 72, "step": "render_pdf" }`. |
| `result` | `object` | Populated when `status` is `completed` (payload mirrors triggering tool). |
| `error` | `object` | Populated when `status` is `failed` (`code`, `message`). |

### Example call

```json
{
  "name": "get_job_status",
  "arguments": {
    "job_id": "job_fmt_8f3c2a"
  }
}
```

### Example response

```json
{
  "job_id": "job_fmt_8f3c2a",
  "status": "completed",
  "result": {
    "formatted_cv": "%PDF-1.7…",
    "format": "pdf"
  }
}
```

---

## See also

- [`api-contract.md`](api-contract.md) — HTTP mapping & error envelope
- [`demo-mode.md`](demo-mode.md) — integration testing without production credentials
