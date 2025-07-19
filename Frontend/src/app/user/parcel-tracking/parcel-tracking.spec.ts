import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelTracking } from './parcel-tracking';

describe('ParcelTracking', () => {
  let component: ParcelTracking;
  let fixture: ComponentFixture<ParcelTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParcelTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
