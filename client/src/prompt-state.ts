import { Injectable, signal, inject, computed } from '@angular/core';
import { PromptService } from './prompt-service';
import { DataRecord } from './shared/types';

@Injectable({
  providedIn: 'root',
})
export class PromptStateService {
  private readonly promptService = inject(PromptService);

  // State Signals that can be modified internally.
  private readonly _isRunning = signal<boolean>(false);
  private readonly _records = signal<DataRecord[]>([]);
  private readonly _error = signal<string | null>(null);

  // Read-only public signals
  readonly isRunning = this._isRunning.asReadonly();
  readonly records = this._records.asReadonly();
  readonly error = this._error.asReadonly();

  // Abort Controller to manage cancellation
  private abortController: AbortController | null = null;

  async runPrompt(promptText: string) {
    this._isRunning.set(true);
    this._error.set(null);
    this.abortController = new AbortController();

    try {
      const records = await this.promptService.queryDataset(
        promptText,
        this.abortController.signal,
      );
      this._records.set(records);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Prompt generation cancelled by user.');
      } else {
        this._error.set(err.message || 'An unexpected error occurred.');
        this._records.set([]);
      }
    } finally {
      this._isRunning.set(false);
      this.abortController = null;
    }
  }

  cancelPromptRun() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this._isRunning.set(false);
  }
}
