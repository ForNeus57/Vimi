import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalNavigationBarComponent } from './horizontal-navigation-bar.component';

describe('HorizontalNavigationBarComponent', () => {
  let component: HorizontalNavigationBarComponent;
  let fixture: ComponentFixture<HorizontalNavigationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalNavigationBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
