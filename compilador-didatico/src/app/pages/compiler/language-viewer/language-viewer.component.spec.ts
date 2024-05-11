import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageViewerComponent } from './language-viewer.component';

describe('LanguageViewerComponent', () => {
  let component: LanguageViewerComponent;
  let fixture: ComponentFixture<LanguageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LanguageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
