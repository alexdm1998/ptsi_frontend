import { TestBed } from '@angular/core/testing';

import { ShowHideService } from './show-hide.service';

describe('ShowHideService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShowHideService = TestBed.get(ShowHideService);
    expect(service).toBeTruthy();
  });
});
