import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSectionsComponent } from './add-edit-sections.component';

describe('AddEditSectionsComponent', () => {
  let component: AddEditSectionsComponent;
  let fixture: ComponentFixture<AddEditSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSectionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
