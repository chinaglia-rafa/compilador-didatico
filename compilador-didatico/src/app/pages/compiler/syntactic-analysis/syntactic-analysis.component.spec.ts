import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyntacticAnalysisComponent } from './syntactic-analysis.component';

describe('SyntacticAnalysisComponent', () => {
  let component: SyntacticAnalysisComponent;
  let fixture: ComponentFixture<SyntacticAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyntacticAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SyntacticAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
