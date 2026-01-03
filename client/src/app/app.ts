import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PromptComponent } from '../prompt-component/prompt-component';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, PromptComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
