import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeGenerationComponent } from './code-generation.component';

describe('CodeGenerationComponent', () => {
  let component: CodeGenerationComponent;
  let fixture: ComponentFixture<CodeGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeGenerationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
