import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerCanvasColorMapIndicatorComponent } from './viewer-canvas-color-map-indicator.component';

describe('ViewerCanvasColorMapIndicatorComponent', () => {
  let component: ViewerCanvasColorMapIndicatorComponent;
  let fixture: ComponentFixture<ViewerCanvasColorMapIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerCanvasColorMapIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerCanvasColorMapIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
