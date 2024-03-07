import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveIconComponent } from './live-icon.component';

describe('LiveIconComponent', () => {
  let component: LiveIconComponent;
  let fixture: ComponentFixture<LiveIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiveIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
