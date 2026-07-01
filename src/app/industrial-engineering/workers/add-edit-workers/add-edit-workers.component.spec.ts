import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWorkersComponent } from './add-edit-workers.component';

describe('AddEditWorkersComponent', () => {
  let component: AddEditWorkersComponent;
  let fixture: ComponentFixture<AddEditWorkersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditWorkersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditWorkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
