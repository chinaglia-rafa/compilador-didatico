import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyntacticTreeComponent } from './syntactic-tree.component';

describe('SyntacticTreeComponent', () => {
  let component: SyntacticTreeComponent;
  let fixture: ComponentFixture<SyntacticTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyntacticTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SyntacticTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
