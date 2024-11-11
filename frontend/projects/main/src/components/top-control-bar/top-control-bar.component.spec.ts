import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopControlBarComponent } from './top-control-bar.component';

describe('TopControlBarComponent', () => {
  let component: TopControlBarComponent;
  let fixture: ComponentFixture<TopControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopControlBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
