import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedDeliveries } from './rejected-deliveries';

describe('RejectedDeliveries', () => {
  let component: RejectedDeliveries;
  let fixture: ComponentFixture<RejectedDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 