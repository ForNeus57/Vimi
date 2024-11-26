import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparatorControlBarComponent } from './comparator-control-bar.component';

describe('ComparatorControlBarComponent', () => {
  let component: ComparatorControlBarComponent;
  let fixture: ComponentFixture<ComparatorControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparatorControlBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparatorControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
