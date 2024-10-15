import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMenuComponent } from './viewer-menu.component';

describe('ViewerMenuComponent', () => {
  let component: ViewerMenuComponent;
  let fixture: ComponentFixture<ViewerMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
