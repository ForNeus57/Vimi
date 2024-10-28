import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMenuFileComponent } from './viewer-menu-file.component';

describe('ViewerMenuFileComponent', () => {
  let component: ViewerMenuFileComponent;
  let fixture: ComponentFixture<ViewerMenuFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerMenuFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerMenuFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
