import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolsTableComponent } from './symbols-table.component';

describe('SymbolsTableComponent', () => {
  let component: SymbolsTableComponent;
  let fixture: ComponentFixture<SymbolsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolsTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SymbolsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
