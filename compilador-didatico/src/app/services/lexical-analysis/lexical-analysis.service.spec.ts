import { TestBed } from '@angular/core/testing';

import { LexicalAnalysisService } from './lexical-analysis.service';

describe('LexicalAnalysisService', () => {
  let service: LexicalAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LexicalAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
