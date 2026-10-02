/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: ToolCallChunk[];
  tool_call_id?: string;
}

export interface ToolCallChunk {
  id?: string;
  index?: number;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}

export interface ModelToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  tools?: ModelToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface StreamDelta {
  role?: string;
  content?: string | null;
  tool_calls?: ToolCallChunk[];
}

export interface StreamChoice {
  index: number;
  delta: StreamDelta;
  finish_reason: 'stop' | 'tool_calls' | 'length' | null;
}

export interface ModelStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface ModelClientConfig {
  provider?: string;         // Default: "ollama"
  baseUrl?: string;          // Default: "http://127.0.0.1:11434/v1"
  model?: string;            // Default: "llama3.2"
  fallbackModels?: string[]; // Default: ["llama3.1:latest", "llama3.1"]
  apiKey?: string;           // Optional
  timeoutMs?: number;        // Default: 30000ms
  mock?: boolean;            // Force offline mock adapter
  temperature?: number;      // Optional
}

export interface ModelClient {
  streamChat(options: ChatCompletionOptions): AsyncGenerator<ModelStreamChunk, void, void>;
  checkHealth(): Promise<{ reachable: boolean; model?: string; error?: string }>;
  getModelName(): string;
}

export class CarefoldModelError extends Error {
  public readonly code: string;
  public readonly isConnectionError: boolean;

  constructor(message: string, code: string, isConnectionError = false) {
    super(message);
    this.name = 'CarefoldModelError';
    this.code = code;
    this.isConnectionError = isConnectionError;
  }
}
