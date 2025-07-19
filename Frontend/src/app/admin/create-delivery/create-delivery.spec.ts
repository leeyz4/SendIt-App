import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDelivery } from './create-delivery';

describe('CreateDelivery', () => {
  let component: CreateDelivery;
  let fixture: ComponentFixture<CreateDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDelivery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
