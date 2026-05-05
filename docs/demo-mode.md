# Demo mode — integrate before production keys arrive

Demo mode lets engineering teams validate **Model Context Protocol** wiring, recruiter prompts, and CI fixtures **without** waiting for onboarding. It complements FormaCV’s isolated production instances: same tool surface, deterministic sample payloads.

## What activates demo mode

The MCP transport treats the following server URL signals as demo:

1. **`FORMACV_SERVER_URL` is unset or empty string** — the package falls back to the hosted demo shim.
2. **Explicit sentinel** `https://demo.formacv.ai`.
3. **Wildcard-friendly hosts** matching `*.demo.formacv.ai` (staging sandboxes labelled as demo subsidiaries).

Anything else—including `https://your-company.formacv.ai`—selects **real mode**, which expects a valid bearer token tied to your infrastructure.

## What demo mode returns

- **Realistic payloads** resembling Bullhorn / JobAdder / Vincere IDs, filenames, and PDF blobs (Base64 or stubbed literals depending on tooling).
- **Predictable transitions** (`queued → processing → completed`) so autonomous **AI agents** can exercise polling logic (`get_job_status`).
- **No billable ATS side-effects** inside customer sandboxes—the objective is connector QA, not live candidate mutation.

Treat responses as canonical **shape-wise** (_fields, enums, casing_) even if content is illustrative.

## Switching to real mode

1. Request your **API key** and **dedicated HTTPS hostname** via [FormaCV contact](https://formacv.ai/#contact).
2. Update AI host configuration (`FORMACV_API_KEY`, `FORMACV_SERVER_URL`)—see [`examples/README.md`](../examples/README.md).
3. Restart the MCP client (Claude Desktop, Cursor, VS Code Copilot Chat) so stdio inherits the refreshed environment variables.

During dual-track rollouts keep **separate MCP server blocks**: one pointing at demo for automated tests and one at production gated behind secrets managers.

## Limitations engineers should remember

Demo mode excels at verifying JSON contracts, recruiter flows, and **recruitment automation** UX. It intentionally does **not**:

- Persist proprietary candidate files from your tenancy.
- Perform authenticated writes against your ATS tenant.
- Enforce SLA-grade latency envelopes.

When you graduate to production, rerun validation against your isolated hostname to observe **authentic OAuth scopes**, webhook signatures, and attachment limits.

Questions about hardened deployments (GDPR, AES-256, per-tenant VPC peering)? Read [Security at FormaCV](https://formacv.ai/security).
