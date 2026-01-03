import { Component, inject, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../shared/spinner-component/spinner-component';
import { PromptStateService } from '../../prompt-state';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-run-button',
  imports: [ButtonModule, TooltipModule, SpinnerComponent],
  templateUrl: './run-button.html',
  styleUrl: './run-button.scss',
})
export class RunButton {
  protected readonly promptStateService = inject(PromptStateService);

  tooltipContent = computed<string>(() =>
    this.promptStateService.isRunning() ? 'Cancel Generation' : 'Run Prompt (\u2318 + Enter)',
  );

  runButtonClicked() {
    if (this.promptStateService.isRunning()) {
      this.promptStateService.cancelPromptRun();
    }
    return true;
  }
}
