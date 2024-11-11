import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomControlBarComponent } from './bottom-control-bar.component';

describe('BottomControlBarComponent', () => {
  let component: BottomControlBarComponent;
  let fixture: ComponentFixture<BottomControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomControlBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
