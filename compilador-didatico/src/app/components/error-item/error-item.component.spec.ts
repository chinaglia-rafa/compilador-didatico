import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorItemComponent } from './error-item.component';

describe('ErrorItemComponent', () => {
  let component: ErrorItemComponent;
  let fixture: ComponentFixture<ErrorItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ErrorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
