import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Homey } from './homey';

describe('Homey', () => {
  let component: Homey;
  let fixture: ComponentFixture<Homey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homey]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Homey);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 