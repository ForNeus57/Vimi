import { TestBed } from '@angular/core/testing';

import { ViewerControlService } from './viewer-control.service';

describe('ViewerControlService', () => {
  let service: ViewerControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewerControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
