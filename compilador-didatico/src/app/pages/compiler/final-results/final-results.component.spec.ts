import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalResultsComponent } from './final-results.component';

describe('FinalResultsComponent', () => {
  let component: FinalResultsComponent;
  let fixture: ComponentFixture<FinalResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
