import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerCanvasControlComponent } from './viewer-canvas-control.component';

describe('ViewerCanvasControlComponent', () => {
  let component: ViewerCanvasControlComponent;
  let fixture: ComponentFixture<ViewerCanvasControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerCanvasControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerCanvasControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
