import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollRegisterComponent } from './roll-register.component';

describe('RollRegisterComponent', () => {
  let component: RollRegisterComponent;
  let fixture: ComponentFixture<RollRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RollRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RollRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
