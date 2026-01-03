import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

import { PromptStateService } from '../prompt-state';
import { RunButton } from './run-button/run-button';
import { RecordTableComponent } from './record-table-component/record-table-component';

@Component({
  selector: 'app-prompt-component',
  imports: [
    CommonModule,
    FormsModule,
    RecordTableComponent,
    RunButton,
    TextareaModule,
    MessageModule,
  ],
  templateUrl: './prompt-component.html',
  styleUrl: './prompt-component.scss',
})
export class PromptComponent {
  readonly promptState = inject(PromptStateService);

  promptText: string = '';

  get isInputActive(): boolean {
    return this.promptText.length > 0;
  }

  onRunButtonClicked() {
    this.triggerRun();
  }

  handleKeydown(event: KeyboardEvent) {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      this.triggerRun();
    }
  }

  private triggerRun() {
    if (!this.promptText.trim()) return;
    this.promptState.runPrompt(this.promptText);
  }
}
