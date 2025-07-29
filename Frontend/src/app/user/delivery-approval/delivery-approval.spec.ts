import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryApproval } from './delivery-approval';

describe('DeliveryApproval', () => {
  let component: DeliveryApproval;
  let fixture: ComponentFixture<DeliveryApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 