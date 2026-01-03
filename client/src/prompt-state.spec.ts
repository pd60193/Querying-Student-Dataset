import { TestBed } from '@angular/core/testing';

import { PromptState } from './prompt-state';

describe('PromptState', () => {
  let service: PromptState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
