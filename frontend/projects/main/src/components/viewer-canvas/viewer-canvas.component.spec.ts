import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerCanvasComponent } from './viewer-canvas.component';

describe('ViewerCanvasComponent', () => {
  let component: ViewerCanvasComponent;
  let fixture: ComponentFixture<ViewerCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
