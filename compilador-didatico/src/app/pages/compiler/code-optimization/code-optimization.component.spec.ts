import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeOptimizationComponent } from './code-optimization.component';

describe('CodeOptimizationComponent', () => {
  let component: CodeOptimizationComponent;
  let fixture: ComponentFixture<CodeOptimizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeOptimizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeOptimizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
