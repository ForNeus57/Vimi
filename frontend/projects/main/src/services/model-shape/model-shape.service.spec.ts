import { TestBed } from '@angular/core/testing';

import { ModelShapeService } from './model-shape.service';

describe('ModelShapeService', () => {
  let service: ModelShapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelShapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
