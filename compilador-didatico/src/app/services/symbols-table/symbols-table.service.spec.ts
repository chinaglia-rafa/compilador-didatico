import { TestBed } from '@angular/core/testing';

import { SymbolsTableService } from './symbols-table.service';

describe('SymbolsTableService', () => {
  let service: SymbolsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SymbolsTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
