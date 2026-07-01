import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditOperationsComponent } from './add-edit-operations.component';

describe('AddEditOperationsComponent', () => {
  let component: AddEditOperationsComponent;
  let fixture: ComponentFixture<AddEditOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditOperationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
