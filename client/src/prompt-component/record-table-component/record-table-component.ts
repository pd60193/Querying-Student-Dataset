import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { PromptStateService } from '../../prompt-state';
import { Column } from '../../shared/types';

@Component({
  selector: 'app-record-table-component',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
  ],
  templateUrl: './record-table-component.html',
  styleUrl: './record-table-component.scss',
})
export class RecordTableComponent {
  protected readonly promptStateService = inject(PromptStateService);
  protected readonly filteringEnabled = signal<boolean>(false);

  searchValue: string = '';

  // Dynamically compute columns based on the first record found
  protected readonly columns = computed<Column[]>(() => {
    const records = this.promptStateService.records();
    if (!records || records.length === 0) {
      return [];
    }
    // Assumes all records have uniform keys
    return Object.keys(records[0]).map((key) => ({ field: key, header: key }));
  });

  // For global filtering
  protected readonly globalFilterFields = computed(() => {
    return this.columns().map((c) => c.field);
  });

  toggleFiltering() {
    this.filteringEnabled.update((v) => !v);
  }

  enableFilteringButtonLabel() {
    if (this.filteringEnabled()) {
      return 'Disable Filtering';
    }
    return 'Enable Filtering';
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }
}
