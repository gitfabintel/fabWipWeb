import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCuttingMasterComponent } from './add-edit-cutting-master.component';

describe('AddEditCuttingMasterComponent', () => {
  let component: AddEditCuttingMasterComponent;
  let fixture: ComponentFixture<AddEditCuttingMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditCuttingMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditCuttingMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
