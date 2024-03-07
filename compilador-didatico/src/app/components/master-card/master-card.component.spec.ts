import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterCardComponent } from './master-card.component';

describe('MasterCardComponent', () => {
  let component: MasterCardComponent;
  let fixture: ComponentFixture<MasterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
