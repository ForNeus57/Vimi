import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMenuDetailComponent } from './viewer-menu-detail.component';

describe('ViewerMenuDetailComponent', () => {
  let component: ViewerMenuDetailComponent;
  let fixture: ComponentFixture<ViewerMenuDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerMenuDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerMenuDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
