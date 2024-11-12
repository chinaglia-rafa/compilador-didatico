import { TestBed } from '@angular/core/testing';

import { CodeGenerationService } from './code-generation.service';

describe('CodeGenerationService', () => {
  let service: CodeGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
