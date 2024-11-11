import { TestBed } from '@angular/core/testing';

import { ControlBarMediatorService } from './control-bar-mediator.service';

describe('ControlBarMediatorService', () => {
  let service: ControlBarMediatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlBarMediatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
