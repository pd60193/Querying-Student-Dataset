import { TestBed } from '@angular/core/testing';

import { GlobalSettingsTs } from './global-settings.ts';

describe('GlobalSettingsTs', () => {
  let service: GlobalSettingsTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSettingsTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
