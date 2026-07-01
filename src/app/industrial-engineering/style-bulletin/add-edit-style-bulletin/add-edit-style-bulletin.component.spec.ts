import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStyleBulletinComponent } from './add-edit-style-bulletin.component';

describe('AddEditStyleBulletinComponent', () => {
  let component: AddEditStyleBulletinComponent;
  let fixture: ComponentFixture<AddEditStyleBulletinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditStyleBulletinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditStyleBulletinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
