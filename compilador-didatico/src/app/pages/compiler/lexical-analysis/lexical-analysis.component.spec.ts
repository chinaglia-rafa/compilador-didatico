import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LexicalAnalysisComponent } from './lexical-analysis.component';

describe('LexicalAnalysisComponent', () => {
  let component: LexicalAnalysisComponent;
  let fixture: ComponentFixture<LexicalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LexicalAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LexicalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
