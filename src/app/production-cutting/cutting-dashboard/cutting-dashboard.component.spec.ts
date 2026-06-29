import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuttingDashboardComponent } from './cutting-dashboard.component';

describe('CuttingDashboardComponent', () => {
  let component: CuttingDashboardComponent;
  let fixture: ComponentFixture<CuttingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuttingDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuttingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
