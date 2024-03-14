import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogItemComponent } from './log-item.component';

describe('LogItemComponent', () => {
  let component: LogItemComponent;
  let fixture: ComponentFixture<LogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
