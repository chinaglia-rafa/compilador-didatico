import { TestBed } from '@angular/core/testing';

import { SyntacticAnalysisService } from './syntactic-analysis.service';

describe('SyntacticAnalysisService', () => {
  let service: SyntacticAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyntacticAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
