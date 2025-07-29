import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedDeliveries } from './approved-deliveries';

describe('ApprovedDeliveries', () => {
  let component: ApprovedDeliveries;
  let fixture: ComponentFixture<ApprovedDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 