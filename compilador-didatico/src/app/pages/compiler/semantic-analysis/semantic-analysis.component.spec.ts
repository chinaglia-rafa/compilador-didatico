import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticAnalysisComponent } from './semantic-analysis.component';

describe('SemanticAnalysisComponent', () => {
  let component: SemanticAnalysisComponent;
  let fixture: ComponentFixture<SemanticAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanticAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SemanticAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
