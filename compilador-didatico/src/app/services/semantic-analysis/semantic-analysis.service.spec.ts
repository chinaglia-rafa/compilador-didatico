import { TestBed } from '@angular/core/testing';

import { SemanticAnalysisService } from './semantic-analysis.service';

describe('SemanticAnalysisService', () => {
  let service: SemanticAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SemanticAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
