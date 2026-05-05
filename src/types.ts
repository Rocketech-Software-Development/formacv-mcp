import type { ZodSchema } from 'zod';

export interface FormaCVConfig {
  apiKey: string;
  serverUrl: string;
  timeoutMs: number;
}

export interface HttpClient {
  call<T>(operation: string, payload: unknown): Promise<T>;
}

export interface ToolContext {
  config: FormaCVConfig;
  client: HttpClient;
  isDemoMode: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ZodSchema;
  handler: (args: unknown, ctx: ToolContext) => Promise<unknown>;
}

export class FormaCVError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'FormaCVError';
  }
}
