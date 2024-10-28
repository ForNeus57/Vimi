import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMenuGeneralComponent } from './viewer-menu-general.component';

describe('ViewerMenuGeneralComponent', () => {
  let component: ViewerMenuGeneralComponent;
  let fixture: ComponentFixture<ViewerMenuGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerMenuGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerMenuGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
