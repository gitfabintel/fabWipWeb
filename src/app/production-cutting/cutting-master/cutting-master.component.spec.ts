import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuttingMasterComponent } from './cutting-master.component';

describe('CuttingMasterComponent', () => {
  let component: CuttingMasterComponent;
  let fixture: ComponentFixture<CuttingMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuttingMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuttingMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
