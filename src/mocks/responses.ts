import { createHash } from 'node:crypto';

import type { AnonymizeCvInputT } from '../schemas/anonymize-cv.js';
import type { BulkFormatInputT } from '../schemas/bulk-format.js';
import type { FormatCvInputT } from '../schemas/format-cv.js';
import type { GetJobStatusInputT } from '../schemas/get-job-status.js';
import type { ListIntegrationsInputT } from '../schemas/list-integrations.js';
import type { ListTemplatesInputT } from '../schemas/list-templates.js';
import type { PushToAtsInputT } from '../schemas/push-to-ats.js';
import type { TailorCvInputT } from '../schemas/tailor-cv.js';
import {
  SAMPLE_ATS_ATTACHMENT_PREFIX,
  SAMPLE_BATCH_ID_PREFIX,
  SAMPLE_PLACEHOLDER_PDF_BASE64,
} from './sample-data.js';

const DEMO_FILE_BASE = 'https://demo.formacv.ai/files';

function hexHash(parts: readonly string[]): string {
  const payload = parts.join('\u241e'); // RECORD SEPARATOR avoids accidental merges
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/** Deterministic lowercase UUID-shaped string from hashed inputs */
function hashedUuid(parts: readonly string[]): string {
  const h = hexHash(parts).padEnd(32, '0').slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function deterministicIso(parts: readonly string[]): string {
  const h = hexHash(parts);
  const dayOffset = Number.parseInt(h.slice(0, 6), 16) % 28;
  const secOffset = Number.parseInt(h.slice(6, 10), 16) % 86_400;
  return new Date(Date.UTC(2026, 4, 1 + dayOffset, 10, 0, secOffset)).toISOString();
}

function fileUrl(parts: readonly string[], ext: 'pdf' | 'docx'): string {
  return `${DEMO_FILE_BASE}/${hashedUuid(parts)}.${ext}`;
}

export function mockFormatCv(input: FormatCvInputT) {
  const h = hexHash([
    'format_cv',
    input.template_id,
    input.cv.source,
    input.cv.data,
    JSON.stringify(input.options ?? {}),
  ]);
  const jobId = `format-${h.slice(0, 8)}`;
  return {
    _demo: true as const,
    job_id: jobId,
    status: 'completed' as const,
    format: 'pdf' as const,
    formatted_cv: {
      url: fileUrl(['format_cv', jobId, input.template_id], 'pdf'),
      base64: SAMPLE_PLACEHOLDER_PDF_BASE64,
    },
  };
}

export function mockTailorCv(input: TailorCvInputT) {
  const h = hexHash([
    'tailor_cv',
    input.template_id ?? '',
    input.cv.source,
    input.cv.data,
    input.vacancy_text,
    input.instructions,
  ]);
  const jobId = `tailor-${h.slice(0, 8)}`;
  const instructionSnippet = input.instructions.trim().slice(0, 56);
  return {
    _demo: true as const,
    job_id: jobId,
    status: 'completed' as const,
    tailored_cv: {
      url: fileUrl(['tailor_cv', jobId], 'pdf'),
    },
    changes_summary: [
      'Promoted vacancy-aligned competencies in the executive summary with bold highlights on product leadership and stakeholder management.',
      'Condensed tenure descriptions for legacy roles older than seven years without removing quantified outcomes cited in the vacancy brief.',
      'Aligned role titles with the recruiter instructions while preserving original employment dates.',
      `Applied tailoring instructions (${instructionSnippet || 'agency defaults'})`,
    ],
  };
}

export function mockAnonymizeCv(input: AnonymizeCvInputT) {
  const defaultStrip = [
    'name',
    'email',
    'phone',
    'photo',
    'address',
    'company_names',
  ] as const;
  const fields = input.fields_to_strip?.length ? input.fields_to_strip : [...defaultStrip];
  const h = hexHash([
    'anonymize_cv',
    input.cv.source,
    input.cv.data,
    fields.slice().sort().join(','),
    String(input.audit_log ?? true),
  ]);
  const jobId = `anon-${h.slice(0, 8)}`;
  const auditId = `audit_${h.slice(8, 16)}`;
  const includeAudit = input.audit_log !== false;

  return {
    _demo: true as const,
    job_id: jobId,
    status: 'completed' as const,
    anonymized_cv: {
      url: fileUrl(['anonymize_cv', jobId, ...fields], 'pdf'),
      base64: SAMPLE_PLACEHOLDER_PDF_BASE64,
    },
    ...(includeAudit
      ? {
          audit: {
            audit_id: auditId,
            fields_removed: [...fields.map(String)],
          },
        }
      : {}),
  };
}

export function mockPushToAts(input: PushToAtsInputT) {
  const h = hexHash([
    'push_to_ats',
    input.formatted_cv_id,
    input.ats,
    input.candidate_id,
    input.attach_as ?? 'default',
  ]);
  return {
    _demo: true as const,
    success: true,
    ats: input.ats,
    ats_attachment_id: `${SAMPLE_ATS_ATTACHMENT_PREFIX}_${input.ats}_${h.slice(0, 12)}`,
    pushed_at: deterministicIso(['push_to_ats', h]),
  };
}

export function mockBulkFormat(input: BulkFormatInputT) {
  const sortedIds = [...input.cv_ids].sort().join('|');
  const h = hexHash(['bulk_format', sortedIds, input.template_id, JSON.stringify(input.options ?? {})]);
  const batchId = `${SAMPLE_BATCH_ID_PREFIX}_${h.slice(0, 10)}`;

  const total = input.cv_ids.length;
  return {
    _demo: true as const,
    batch_id: batchId,
    total,
    queued: total,
    status: 'queued' as const,
  };
}

export function mockListTemplates(_input: ListTemplatesInputT) {
  const updated = deterministicIso(['list_templates', 'baseline']);
  return {
    _demo: true as const,
    templates: [
      {
        id: `tpl_standard_${hexHash(['tpl', 'aurora']).slice(0, 8)}`,
        name: 'Aurora Consultants — Primary',
        description:
          'Executive search layout with restrained typography, skills matrix for client narratives, and policy-friendly disclaimer blocks.',
        category: 'standard' as const,
        last_updated: updated,
      },
      {
        id: `tpl_compliance_bank_${hexHash(['tpl', 'bank']).slice(0, 8)}`,
        name: 'Bank Compliance — Shortlist Blind',
        description:
          'Compliance-specific CV for regulated banking mandates: suppressed personal imagery, tightened role chronology for audit trails, ATS-safe typography.',
        category: 'compliance' as const,
        last_updated: deterministicIso(['list_templates', 'bank']),
      },
      {
        id: `tpl_anonymized_${hexHash(['tpl', 'blind']).slice(0, 8)}`,
        name: 'Blind Submission Kit',
        description:
          'Anonymised export pack with recruiter-only footnotes retained for MCP automation while candidate identifiers are stripped upstream.',
        category: 'anonymized' as const,
        last_updated: deterministicIso(['list_templates', 'blind']),
      },
      {
        id: `tpl_contract_${hexHash(['tpl', 'contract']).slice(0, 8)}`,
        name: 'Contract + IR35 Spotlight',
        description:
          'Highlights contingent workforce outcomes, badges compliance notes, mirrors JobAdder client branding slots per branch.',
        category: 'standard' as const,
        last_updated: deterministicIso(['list_templates', 'contract']),
      },
      {
        id: `tpl_rpo_${hexHash(['tpl', 'rpo']).slice(0, 8)}`,
        name: 'Rapid RPO Slate',
        description:
          'Vincere-aligned layout tuned for MSP programmes: highlights statement of work wins, normalises skills clusters, and keeps marketplace metadata visible for Bullhorn automations.',
        category: 'standard' as const,
        last_updated: deterministicIso(['list_templates', 'rpo']),
      },
    ],
  };
}

export function mockListIntegrations(_input: ListIntegrationsInputT) {
  return {
    _demo: true as const,
    integrations: [
      {
        ats: 'bullhorn' as const,
        status: 'connected' as const,
        connected_at: deterministicIso(['integrations', 'bullhorn']),
      },
      {
        ats: 'jobadder' as const,
        status: 'pending' as const,
        connected_at: undefined,
      },
      {
        ats: 'vincere' as const,
        status: 'disconnected' as const,
        connected_at: undefined,
      },
      {
        ats: 'salesforce' as const,
        status: 'disconnected' as const,
        connected_at: undefined,
      },
      {
        ats: 'hubspot' as const,
        status: 'disconnected' as const,
        connected_at: undefined,
      },
    ],
  };
}

export function mockGetJobStatus(input: GetJobStatusInputT) {
  const h = hexHash(['get_job_status', input.job_id]);
  return {
    _demo: true as const,
    job_id: input.job_id,
    status: 'completed' as const,
    percent_complete: 100,
    result_url: fileUrl(['get_job_status', input.job_id, h], 'pdf'),
  };
}
