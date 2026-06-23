import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaySpreadingReportComponent } from './lay-spreading-report.component';

describe('LaySpreadingReportComponent', () => {
  let component: LaySpreadingReportComponent;
  let fixture: ComponentFixture<LaySpreadingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaySpreadingReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaySpreadingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
