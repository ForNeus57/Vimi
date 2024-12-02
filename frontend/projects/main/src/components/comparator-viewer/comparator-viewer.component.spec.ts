import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparatorViewerComponent } from './comparator-viewer.component';

describe('ComparatorViewerComponent', () => {
  let component: ComparatorViewerComponent;
  let fixture: ComponentFixture<ComparatorViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparatorViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparatorViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
