export interface Column {
  field: string;
  header: string;
}

// A generic record type to replace 'Object'
export type DataRecord = Record<string, any>;

export interface PromptRequest {
  prompt: string;
}
