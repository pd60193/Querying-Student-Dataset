import { DOCUMENT } from '@angular/common';
import { Component, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSettings {
  private document = inject(DOCUMENT);

  isDarkMode(): boolean {
    // Replace '.my-app-dark' with your configured darkModeSelector
    return this.document.documentElement.classList.contains('my-app-dark');
  }
}
