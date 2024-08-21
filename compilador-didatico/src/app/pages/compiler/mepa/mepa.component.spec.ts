import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MepaComponent } from './mepa.component';

describe('MepaComponent', () => {
  let component: MepaComponent;
  let fixture: ComponentFixture<MepaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MepaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MepaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
