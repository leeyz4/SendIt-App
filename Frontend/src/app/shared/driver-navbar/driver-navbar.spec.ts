import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverNavbar } from './driver-navbar';

describe('DriverNavbar', () => {
  let component: DriverNavbar;
  let fixture: ComponentFixture<DriverNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
