import { TestBed } from '@angular/core/testing';

import { MepaService } from './mepa.service';

describe('MepaService', () => {
  let service: MepaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MepaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
