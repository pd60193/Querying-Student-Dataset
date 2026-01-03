import { Injectable } from '@angular/core';
import { DataRecord, PromptRequest } from './shared/types';

// TODO: Put this in environment.ts
const API_URL = 'http://localhost:3000/api/query';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  /**
   * Queries the dataset.
   * @param prompt The text prompt
   * @param signal The AbortSignal to cancel the request
   */
  async queryDataset(prompt: string, signal?: AbortSignal): Promise<DataRecord[]> {
    try {
      const body: PromptRequest = { prompt };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: signal,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (e: unknown) {
      // If the user cancelled, we do not log or alert so the state knows it was intentional
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw e;
      }

      // Normalize error
      const error = e instanceof Error ? e : new Error(String(e));
      console.error('API Error:', error);
      alert(`Error querying dataset: ${error.message}`);
      throw error;
    }
  }
}
