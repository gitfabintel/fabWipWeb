import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanCuttingComponent } from './scan-cutting.component';

describe('ScanCuttingComponent', () => {
  let component: ScanCuttingComponent;
  let fixture: ComponentFixture<ScanCuttingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanCuttingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanCuttingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
