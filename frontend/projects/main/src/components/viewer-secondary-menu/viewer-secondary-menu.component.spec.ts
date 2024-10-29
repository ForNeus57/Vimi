import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerSecondaryMenuComponent } from './viewer-secondary-menu.component';

describe('ViewerSecondaryMenuComponent', () => {
  let component: ViewerSecondaryMenuComponent;
  let fixture: ComponentFixture<ViewerSecondaryMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerSecondaryMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerSecondaryMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
