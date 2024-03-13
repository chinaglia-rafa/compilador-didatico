import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggerDisplayComponent } from './logger-display.component';

describe('LoggerDisplayComponent', () => {
  let component: LoggerDisplayComponent;
  let fixture: ComponentFixture<LoggerDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggerDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoggerDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
