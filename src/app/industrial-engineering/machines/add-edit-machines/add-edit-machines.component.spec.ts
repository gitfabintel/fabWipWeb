import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditMachinesComponent } from './add-edit-machines.component';

describe('AddEditMachinesComponent', () => {
  let component: AddEditMachinesComponent;
  let fixture: ComponentFixture<AddEditMachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditMachinesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditMachinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
