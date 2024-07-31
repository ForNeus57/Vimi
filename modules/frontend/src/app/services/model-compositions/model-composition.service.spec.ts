import { TestBed } from '@angular/core/testing';

import { ModelCompositionService } from './model-composition.service';

describe('ModelCompositionService', () => {
  let service: ModelCompositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelCompositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
