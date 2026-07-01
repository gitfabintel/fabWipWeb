import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleBulletinComponent } from './style-bulletin.component';

describe('StyleBulletinComponent', () => {
  let component: StyleBulletinComponent;
  let fixture: ComponentFixture<StyleBulletinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StyleBulletinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StyleBulletinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
