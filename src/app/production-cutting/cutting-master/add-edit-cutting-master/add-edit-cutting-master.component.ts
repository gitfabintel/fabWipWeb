import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ServiceService } from 'src/app/shared/service.service';
import { Dateformater } from 'src/app/shared/dateformater';
import { Store } from '@ngrx/store';
        import { map } from 'rxjs/operators';
        import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
        import { forkJoin, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
export interface SizeConfig {
  id?: number;           // ── ADD ──
  sizeId?: number;
  insertOrder?: number;
  name: string;
  poQty: number;
  cutQty: number;
  totalCalculated: number;
  diff: number;        // totalCalculated - cutQty
}

export interface LayRow {
  id?: number;           // ── ADD ──
  inseam: string;
  shrinkage: string;
  layNumber: number;  
  markerName: string;
    markerAvg: number;      // AVG column
  markerLength: number;   // MARKER LENGTH
  markerWidth: number;    // MARKER WIDTH
  plies: number;          // PLIES QTY
  markerDiff: number; 
  reqFabric: number;    // DIFF (calculated)
  status: string;         // STATUS
  breakdown: { [sizeName: string]: number }; // Holds ratios per size
  rowTotalRatio: number;   
   totalPcs: number;       // calculated                  // Sum of ratios in this row
}

export interface Section {
  id: number;
  tempKey?: number;
  name: string;
  color: string;
  sizes: SizeConfig[];
  fabricId: number | null;
  lays: LayRow[];
  totalPoQty: number;
  totalCutQty: number;
  totalDiff: number;
  grandTotalPlies: number;
  grandTotalGarments: number; // Grand total of cut pieces for this section
}
@Component({
  selector: 'app-add-edit-cutting-master',
  templateUrl: './add-edit-cutting-master.component.html',
  styleUrls: ['./add-edit-cutting-master.component.css']
})
export class AddEditCuttingMasterComponent {
 @Input() statusCheck: any;
   @Input() PId: any;
  public loading = false;
    response: any;
  data: any = {
    sizeBreakdown: [],
    sectionQty: [],
    totalOrderQty: 0,
    totalAssigned: 0,
    totalRemaining: 0,
    totalBundles: 0,
    totalSectionQty: 0,
    totalRemainder: 0,
    extraPct: 5,
    extraQty: 0,
    totalWithExtra: 0,
    bundleSize: 25,
    startBundleNo: 1001,
    remarks: '',
  };
    sizes: any[] = []; // dynamic from API
  // sections: any[] = [];

  activeSectionIdx: number = 0;
  bundlePreview: any[] = [];
  focusSizeIdx: number = -1;
  sectionColors: string[] = ['#2563eb', '#16a34a', '#f97316', '#7c3aed', '#e11d48', '#0891b2'];

    canUpdate$!: Observable<boolean>;
    dateformater: Dateformater = new Dateformater();
Jobs: any = [];

jobDetails = {
    jobNo: 'PO009663N',
    style: 'ORN',
    fabric: '65% POLY/COTTON TWILL',
    orderQty: 4752,
    plannedCut: 4761
  };

  // Form Model for Cut Details
  cutDetails = {
    cutNo: 1,
    marker: 'MK-99',
    bundleSize: 25,
    shade: 'Shade A',
    shrinkage: 2.5,
    createdDateTime: new Date().toISOString().substring(0, 10)
  };

  // Master List containing Sections -> Lays data model
  sections: Section[] = [];
  activeSection!: Section;
      constructor(
    private http: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private _NgbActiveModal: NgbActiveModal,
    public formBuilder: FormBuilder,
    private service: ServiceService,
    private store: Store,
    private route: ActivatedRoute
  ) {}

   ngOnInit(): void {
    const menuName = 'Cutting Marker Planning';
    const permission$ = this.store.select(selectPermissionByMenu(menuName));
    this.canUpdate$ = permission$.pipe(map((p: any) => p?.canUpdate ?? false));
    this.statusCheck = this.route.snapshot.queryParamMap.get('statusCheck');
   
     this.GetJobNumberApprovedBomList();
   

    this.statusCheck = this.statusCheck;

    if (this.statusCheck == 'Edit') {
       this.PId = this.route.snapshot.queryParamMap.get('PId');
  //     forkJoin([
  //   this.http.get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`),
  //   this.http.get(`${environment.apiUrl}/api/WageOperation/GetWageOperationList`),
  //   this.http.get(`${environment.apiUrl}/api/WageMachice/GetWageMachiceList`)
  // ]).subscribe(([sections, operations, machines]: any) => {

  //   this.sectionsMaster = sections.data;
  //   this.operationsMaster = operations.data;
  //   this.machines = machines.data;

    // call get
    this.get();
  // });
  
    }

    if (this.statusCheck == 'Add') {
      
// this.initializeDefaultData();
    this.calculateAll();
      this.data.active = true;
      const currentDate = new Date();
      
      // Format the date as "yyyy-MM-dd"
      const formattedDate =
        currentDate.getFullYear() +
        '-' +
        ('0' + (currentDate.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + currentDate.getDate()).slice(-2);
        this.data.createdDateTime =this.dateformater.fromModel1(formattedDate);

      
    }
  }
computeAutoBundleSize(): void {
  const allTotals: number[] = [];
  this.sections.forEach((sec: any) => {
    sec.sizes.forEach((sz: any) => {
      if (sz.totalCalculated > 0) allTotals.push(sz.totalCalculated);
    });
  });
  if (allTotals.length === 0) return;

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const gcdAll = allTotals.reduce((a, b) => gcd(a, b));
  this.cutDetails.bundleSize = Math.min(50, Math.max(10, gcdAll));
}

calculateAll(): void {
  this.sections.forEach(sec => {
    sec.totalPoQty  = sec.sizes.reduce((sum, s) => sum + (s.poQty  || 0), 0);
    sec.totalCutQty = sec.sizes.reduce((sum, s) => sum + (s.cutQty || 0), 0);

    sec.sizes.forEach(s => s.totalCalculated = 0);
    sec.grandTotalPlies    = 0;
    sec.grandTotalGarments = 0;

    sec.lays.forEach(lay => {
      sec.grandTotalPlies += (lay.plies || 0);

      // L = rowTotalRatio = SUM of all size ratios in this row
      let ratioSum = 0;
      sec.sizes.forEach(sz => {
        const ratio = lay.breakdown[sz.name] || 0;
        ratioSum += ratio;
      });
      lay.rowTotalRatio = ratioSum;
      lay.markerDiff = 0;
      // A = totalPcs = Plies * rowTotalRatio
      lay.totalPcs = (lay.plies || 0) * ratioSum;

      // B = reqFabric = MarkerLength * Plies
      lay.reqFabric = parseFloat(((lay.markerLength || 0) * (lay.plies || 0)).toFixed(2));

      // C = markerAvg = reqFabric / totalPcs
      lay.markerAvg = lay.totalPcs > 0
        ? parseFloat((lay.reqFabric / lay.totalPcs).toFixed(4))
        : 0;

      // Per-size achieved = Plies * ratio for that size (M57 formula)
      sec.sizes.forEach(sz => {
        const ratio = lay.breakdown[sz.name] || 0;
        sz.totalCalculated += (lay.plies || 0) * ratio;
      });

      sec.grandTotalGarments += lay.totalPcs;
    });

    // M8 = M57 - M7 → DIFF = achieved - cutQty (per size)
    sec.sizes.forEach(s => s.diff = s.totalCalculated - s.cutQty);
    sec.totalDiff = sec.sizes.reduce((sum, s) => sum + s.diff, 0);

    // markerDiff per lay — Excel doesn't have a per-lay DIFF using A/B,
    // L8 row DIFF is per-size (handled above). Remove lay.markerDiff
    // or repurpose if needed — see note below.
  });
  this.computeAutoBundleSize(); 
}

 addSection(): void {
  const name = prompt('Enter Section Name (e.g. TALL, LINING):');
  if (!name) return;
 
  const colors = ['#ea580c', '#7c3aed', '#db2777', '#06b6d4', '#0891b2', '#16a34a'];
  const randomColor = colors[this.sections.length % colors.length];
 
  // ── Build sizes from sizeHeaders (always sorted by insertOrder) ──
  const sizeSource = (this.data.sizeHeaders?.length > 0
    ? this.data.sizeHeaders
    : this.sections[0]?.sizes || []
  )
    .slice()
    .sort((a: any, b: any) => (a.insertOrder || 0) - (b.insertOrder || 0));
 
  if (sizeSource.length === 0) {
    this.toastr.warning('Please select a job first to load sizes.', 'Warning');
    return;
  }
 
  // ── Try to find matching BOM row for this section name ──
  // Look in objBOMDetailMatrix for a row whose secName matches (case-insensitive)
  const bomMatch = (this.data.objBOMDetailMatrix || []).find(
    (row: any) => row.secName?.toLowerCase() === name.trim().toLowerCase()
  );
 
  // ── If no BOM row matches by name, use the FIRST BOM row as reference
  // for poQty / cutQty so the summary table shows real values ──
  const bomRef = bomMatch || (this.data.objBOMDetailMatrix?.[0]) || null;
 
  const sizes = sizeSource.map((sz: any) => {
    const sizeName = sz.sizeName || sz.name;
 
    // Find matching size in the BOM reference row
    const bomSize = bomRef?.sizes?.find(
      (bs: any) => (bs.sizeName || bs.name) === sizeName || bs.sizeId === sz.sizeId
    );
 
    return {
      name:            sizeName,
      sizeId:          sz.sizeId,
      insertOrder:     sz.insertOrder || 0,
      // Inherit from BOM if found, otherwise 0 (user fills in lay matrix)
      poQty: bomSize?.quantity ?? bomSize?.poQty ?? 0,
      cutQty:(bomSize?.cutQty) ?? ((bomSize?.quantity || 0) + (bomSize?.additionalQuantity || 0)),
      totalCalculated: 0,
      diff:            0,
    };
  });
 
  const newSection: Section = {
    id:                 0,
    tempKey:            Date.now(),
    name:               name.trim().toUpperCase(),
    color:              randomColor,
    fabricId:           null,
    sizes,
    lays:               [],
    totalPoQty:         sizes.reduce((s:any, sz:any) => s + (sz.poQty  || 0), 0),
    totalCutQty:        sizes.reduce((s:any, sz:any) => s + (sz.cutQty || 0), 0),
    totalDiff:          0,
    grandTotalPlies:    0,
    grandTotalGarments: 0,
  };
 
  this.sections.push(newSection);
  this.selectSection(newSection);
}

  deleteSection(section: Section, event: Event): void {
    event.stopPropagation(); // Stop switching selection during deletion target mapping
    if (this.sections.length <= 1) {
      alert('At least one operational manufacturing segment layout must exist.');
      return;
    }
   if (confirm(`Delete section ${section.name} and all matching matrices?`)) {
    this.sections = this.sections.filter(s =>
      s.id !== section.id || s.tempKey !== section.tempKey   // ── safe compare ──
    );
    if (this.activeSection.id === section.id &&
        this.activeSection.tempKey === section.tempKey) {
      this.selectSection(this.sections[0]);
    } else {
      this.calculateAll();
    }
  }
  }

selectSection(section: Section): void {
    this.activeSection = section;
    this.calculateAll();
  }
addLayRow(): void {
  const newLay: LayRow = {
    inseam: 'REG',
    shrinkage: '0X0%',
    markerName: `M${this.activeSection.lays.length + 1}`,
    layNumber: this.activeSection.lays.length + 1, 
    markerAvg: 0,
    markerLength: 0,
    reqFabric: 0,
    markerWidth: 0,
    plies: 0,
    markerDiff: 0,
    status: '',
    breakdown: {},
    rowTotalRatio: 0,
    totalPcs: 0
  };
  this.activeSection.lays.push(newLay);
  this.calculateAll();
}

  deleteLayRow(index: number): void {
    if (confirm('Remove this lay entry line execution?')) {
      this.activeSection.lays.splice(index, 1);
      this.calculateAll();
    }
  }
   GetJobNumberApprovedBomList() {
    this.service.GetJobNumberApprovedBomLists().subscribe((res) => {
      this.response = res;
      if (this.response.success == true) {
        this.Jobs = this.response.data;
      } else {
        this.toastr.error(this.response.message, 'Message.');
      }
    });
  }
get() {
  this.spinner.show();
  this.http
    .get(`${environment.apiUrl}/api/ProductionCutting/GetCuttingById/` + this.PId)
    .subscribe(
      (res) => {
        this.response = res;
        if (this.response.success == true) {
          const header = this.response.data;

          // ── Header level data ──
           this.data.id              = header.id;    
          this.data.jobId           = header.jobId;
          this.data.bomId           = header.bomId;
          this.data.customerId      = header.customerId;
          this.data.styleId         = header.styleId;
          this.data.colorId         = header.colorId;
          this.data.articleId       = header.articleId;
          this.data.totalUnits      = header.orderQty;
          this.data.plannedCutQty   = header.plannedCutQty;
          this.data.extraPercentage = header.extraPercentage;
          this.data.colorName = header.colorName;
          this.data.articleName = header.articleName;
          this.data.customerName = header.customerName;
          this.data.styleName = header.styleName;

          // Take the first cut (or loop if you support multiple cuts)
          const cut = header.cuts?.[0];
          if (!cut) {
            this.spinner.hide();
            return;
          }
this.data.cutId = cut.id;
          // ── Cut details (left panel) ──
          this.cutDetails.cutNo      = cut.cutNo;
          this.cutDetails.bundleSize = cut.bundleSize;
          this.cutDetails.shade      = cut.globalShade;

          // ── Build sizeHeaders from first section's sizes ──
          const firstSection = cut.sections?.[0];
          this.data.sizeHeaders = (firstSection?.sizes || []).map((sz: any) => ({
            sizeId:      sz.sizeId,
            sizeName:    sz.sizeName,
            insertOrder: sz.insertOrder
          }));

          // ── Build objBOMDetailMatrix (for the top summary table) ──
          this.data.objBOMDetailMatrix = (cut.sections || []).map((sec: any) => ({
            rowNumber: sec.rowNumber,
            secName:   sec.sectionName,
            sizes: (sec.sizes || []).map((sz: any) => ({
              sizeId:             sz.sizeId,
              sizeName:           sz.sizeName,
              insertOrder:        sz.insertOrder,
              quantity:           sz.poQty,
              additionalQuantity: sz.cutQty - sz.poQty,  // extra portion
              cutQty:             sz.cutQty
            }))
          }));

          // ── Build sections (production sheet) ──
          this.sections = (cut.sections || []).map((sec: any) => {
            const sizes: SizeConfig[] = (sec.sizes || []).map((sz: any) => ({
              id:              sz.id,
              name:            sz.sizeName,
              sizeId:          sz.sizeId,
              insertOrder:     sz.insertOrder,
              poQty:           sz.poQty,
              cutQty:          sz.cutQty,
              totalCalculated: sz.totalCalculated,
              diff:            sz.diff
            }));

            const lays: LayRow[] = (sec.lays || []).map((lay: any) => {
              const breakdown: { [key: string]: number } = {};
              const breakdownIds: { [key: string]: number } = {};
              (lay.breakdowns || []).forEach((bd: any) => {
                breakdown[bd.sizeName] = bd.ratio;
                breakdownIds[bd.sizeName] = bd.id;
              });

              return {
                id:            lay.id,     
                inseam:        lay.inseam,
                layNumber:     lay.layNumber, 
                shrinkage:     lay.shrinkage,
                markerName:    lay.markerName,
                markerAvg:     lay.markerAvg,
                markerLength:  lay.markerLength,
                markerWidth:   lay.markerWidth,
                plies:         lay.plies,
                reqFabric:     lay.reqFabric ?? 0,
                markerDiff:    lay.markerDiff,
                status:        lay.status,
                breakdown:     breakdown,
                breakdownIds:  breakdownIds, 
                rowTotalRatio: lay.rowTotalRatio,
                totalPcs:      lay.totalPcs
              } as LayRow;
            });

            return {
              
              id:                 sec.id,           // keep real DB id for edit/update
              name:               sec.sectionName,
              color:              sec.color,
              fabricId:           sec.fabricId != null ? Number(sec.fabricId) : null,
              sizes:              sizes,
              lays:               lays,
              totalPoQty:         sec.totalPoQty,
              totalCutQty:        sec.totalCutQty,
              totalDiff:          sec.totalDiff,
              grandTotalPlies:    sec.grandTotalPlies,
              grandTotalGarments: sec.grandTotalGarments
            } as Section;
          });

          // ── Set active section ──
          if (this.sections.length > 0) {
            this.activeSection    = this.sections[0];
            this.activeSectionIdx = 0;
          }

          // ── Recalculate to ensure derived values are fresh ──
          this.calculateAll();
this.loadFabricOptions(this.data.jobId);
          this.spinner.hide();
        } else {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
        }
      },
      (err) => {
        if (err.status == 400) {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
        }
      }
    );
}
loadFabricOptions(jobId: number) {
  this.http
    .get(`${environment.apiUrl}/api/ProductionCutting/GetJobDetailsForCutting/` + jobId)
    .subscribe((res: any) => {
      if (res.success) {
        this.data.fabricOptions = (res.data.objBOMFabric || []).map((f: any) => ({
          id: f.itemId,
          label: `${f.itemCode || ''} - ${f.itemName || ''}`.trim(),
          Cons:f.quantity,
        }));
      }
    });
}
getTotalMarkerAvg(): number {
  return parseFloat(
    (this.activeSection?.lays || [])
      .reduce((sum: number, lay: any) => sum + (lay.markerAvg || 0), 0)
      .toFixed(4)
  );
}

getTotalMarkerLength(): number {
  return parseFloat(
    (this.activeSection?.lays || [])
      .reduce((sum: number, lay: any) => sum + (lay.markerLength || 0), 0)
      .toFixed(2)
  );
}

getTotalMarkerWidth(): number {
  return parseFloat(
    (this.activeSection?.lays || [])
      .reduce((sum: number, lay: any) => sum + (lay.markerWidth || 0), 0)
      .toFixed(2)
  );
}
getSelectedFabric(section: Section): any {
  if (!section?.fabricId || !this.data.fabricOptions?.length) return null;
  return this.data.fabricOptions.find((f: any) => f.id === Number(section.fabricId)) || null;
}
    get totalQuantity() {
    return this.data.sizeBreakdown.reduce((sum:any, c:any) => sum + c.quantity, 0);
  }

  get totalWith10() {
    return this.data.sizeBreakdown.reduce((sum:any, c:any) => sum + Math.floor(c.additionalQuantity), 0);
  }
generateBundles(){
  this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GenerateBundles/` + this.data.cutId)
      .subscribe(
        (res) => {
          this.response = res;
          if (this.response.success == true) {
              this.toastr.success(this.response.message, 'Message.');
            this.spinner.hide();
          } else {
            this.toastr.error(this.response.message, 'Message.');
            this.spinner.hide();
          }
        },
        (err) => {
          if (err.status == 400) {
            this.toastr.error(this.response.message, 'Message.');
            this.spinner.hide();
          }
        }
      );
}
  // get totalCut() {
  //   return this.data.sizeBreakdown.reduce((sum:any, c:any) => sum + c.totalCut, 0);
  // }
onJobChange() {
  this.spinner.show();
  this.http
    .get(`${environment.apiUrl}/api/ProductionCutting/GetJobDetailsForCutting/` + this.data.jobId)
    .subscribe(
      (res) => {
        this.response = res;
        if (this.response.success == true) {
          this.data = this.response.data;

          const rawDetails: any[] = this.data.objBOMDetail || [];

          // ── Group by rowNumber, sort sizes by insertOrder ──
          const matrixMap = new Map<number, any>();

          rawDetails.forEach((detail: any) => {
            const rowNum = Number(detail.rowNumber);
            if (!matrixMap.has(rowNum)) {
              matrixMap.set(rowNum, {
                rowNumber: rowNum,
                secName: detail.secName,
                sizes: []
              });
            }
            const row = matrixMap.get(rowNum)!;
            const existing = row.sizes.find((s: any) => s.sizeId === detail.sizeId);
            if (existing) {
              existing.quantity           += Number(detail.quantity || 0);
              existing.additionalQuantity += Number(detail.additionalQuantity || 0);
              existing.cutQty             += Number(detail.cutQty || 0);
            } else {
              row.sizes.push({
                sizeId:             detail.sizeId,
                sizeName:           detail.sizeName,
                insertOrder:        detail.insertOrder,
                quantity:           Number(detail.quantity || 0),
                additionalQuantity: Number(detail.additionalQuantity || 0),
                cutQty:             Number(detail.cutQty || 0)
              });
            }
          });

          // Sort sections by rowNumber, sizes by insertOrder
          this.data.objBOMDetailMatrix = Array.from(matrixMap.values())
            .sort((a, b) => a.rowNumber - b.rowNumber)
            .map((row: any) => ({
              ...row,
              sizes: row.sizes.sort((a: any, b: any) => a.insertOrder - b.insertOrder)
            }));

          this.data.sizeHeaders   = this.data.objBOMDetailMatrix[0]?.sizes || [];
          this.data.sizeBreakdown = rawDetails;

          // ── Build sections for production sheet ──
          const sectionColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          this.sections = this.data.objBOMDetailMatrix.map((row: any, idx: number) => ({
            id:                 idx + 1,
            name:               row.secName,
            color:              sectionColors[idx % sectionColors.length],
            sizes:              row.sizes.map((sz: any) => ({
              name:             sz.sizeName,
              sizeId:           sz.sizeId,
              insertOrder:     sz.insertOrder,
              poQty:            sz.quantity,
              cutQty:           sz.cutQty,
              totalCalculated:  0,
              diff:             0
            })),
            totalPoQty:         row.sizes.reduce((s: number, sz: any) => s + (sz.quantity || 0), 0),
            totalCutQty:        row.sizes.reduce((s: number, sz: any) => s + (sz.cutQty   || 0), 0),
            grandTotalGarments: 0,
            grandTotalPlies:    0,
            totalDiff:          0,
            lays:               []
          }));

          if (this.sections.length > 0) {
            this.activeSection    = this.sections[0];
            this.activeSectionIdx = 0;
          }

          this.data.fabricOptions = (this.data.objBOMFabric || []).map((f: any) => ({
  id: Number(f.itemId), 
  label: `${f.fullCode || ''} - ${f.itemName || ''}`.trim()
}));

// Default fabricId for each section (null = not selected)
this.sections.forEach((sec: any) => {
  sec.fabricId = null;
});

          this.spinner.hide();
          this.computeExtra();

        } else {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
        }
      },
      (err) => {
        if (err.status == 400) {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
        }
      }
    );
  this.computeExtra();
}
getTotalCutForSize(sizeIndex: number): number {
  return (this.data.objBOMDetailMatrix || []).reduce((sum: number, section: any) => {
    const sz = section.sizes[sizeIndex];
    return sum + (sz?.quantity || 0) + (sz?.additionalQuantity || 0);
  }, 0);
}
getSectionTotalDisplay(section: any, field: string): number {
  return (section.sizes || []).reduce((sum: number, sz: any) => sum + (sz[field] || 0), 0);
}

getGrandTotalCut(): number {
  return (this.data.objBOMDetailMatrix || []).reduce((sum: number, section: any) =>
    sum + section.sizes.reduce((s: number, sz: any) =>
      s + (sz.quantity || 0) + (sz.additionalQuantity || 0), 0), 0);
}
  computeExtra() {
    const pct = this.data.extraPercentage || 0;
    let totalExtra = 0;
    for (const row of this.data.sizeBreakdown || []) {
      row.extraQty       = Math.ceil((row.orderQty || 0) * pct / 100);
      row.totalWithExtra = (row.orderQty || 0) + row.extraQty;
      totalExtra        += row.extraQty;
    }
    this.data.extraQty       = totalExtra;
    this.data.totalWithExtra = (this.data.orderQty || 0) + totalExtra;
  }
getAchievementPct(sz: SizeConfig): number {
  if (!sz.poQty) return 0;
  return Math.round((sz.totalCalculated / sz.poQty) * 100);
}

getOverallAchievementPct(): number {
    const totalPo = this.activeSection.sizes.reduce((s, sz) => s + (sz.poQty || 0), 0);
  if (!totalPo) return 0;
  return Math.round((this.activeSection.grandTotalGarments / totalPo) * 100);
}

getTotalReqFabric(): number {
  return parseFloat(
    (this.activeSection?.lays || [])
      .reduce((sum: number, lay: any) => sum + (lay.reqFabric || 0), 0)
      .toFixed(2)
  );
}
  setActiveSection(idx: number) {
    this.activeSectionIdx = idx;
    this.activeSection = this.sections[idx] || null;
  }

  getLayTotal(lay: any): number {
    if (!lay?.ratios) return 0;
    return lay.ratios.reduce((sum: number, r: number) => sum + (r || 0), 0);
  }

  getTotalPlies(): number {
    if (!this.activeSection?.lays) return 0;
    return this.activeSection.lays.reduce((sum: number, l: any) => sum + (l.plies || 0), 0);
  }

  getSizeTotalForSection(si: number): number {
    if (!this.activeSection?.lays) return 0;
    return this.activeSection.lays.reduce((sum: number, l: any) => sum + (l.ratios?.[si] || 0), 0);
  }

  getSectionTotal(): number {
    if (!this.activeSection?.lays) return 0;
    return this.activeSection.lays.reduce((sum: number, l: any) => sum + this.getLayTotal(l), 0);
  }

  get totalLaysCount(): number {
    return this.sections.reduce((sum: number, s: any) => sum + (s.lays?.length || 0), 0);
  }

  get totalPliesCount(): number {
    return this.sections.reduce((sum: number, s: any) =>
      sum + (s.lays || []).reduce((ps: number, l: any) => ps + (l.plies || 0), 0), 0);
  }

  get estimatedBundles(): number {
    const size = this.data.bundleSize || 1;
    return Math.ceil((this.data.plannedCutQty || 0) / size);
  }
buildApiPayload(): any {
  const isEdit = this.statusCheck === 'Edit';
  return {
    id: isEdit ? (this.data.id || 0) : 0,                  // ── header id ──
    jobId: this.data.jobId,
    bomId: this.data.bomId,
    customerId: this.data.customerId || 0,
    styleId: this.data.styleId || 0,
    colorId: this.data.colorId || 0,
    articleId: this.data.articleId || 0,
    orderQty: this.data.totalUnits,
    plannedCutQty: this.data.plannedCutQty,
    extraPercentage: this.data.extraPercentage,
    status: this.data.status || 'Draft',
    cuts: [{
      id: isEdit ? (this.data.cutId || 0) : 0,             // ── cut id ──
      cutNo: this.cutDetails.cutNo,
      bundleSize: this.cutDetails.bundleSize,
      globalShade: this.cutDetails.shade,
      grandTotalPlies: this.sections.reduce((s, sec) => s + sec.grandTotalPlies, 0),
      grandTotalGarments: this.sections.reduce((s, sec) => s + sec.grandTotalGarments, 0),
      totalDiff: this.sections.reduce((s, sec) => s + sec.totalDiff, 0),
      status: 'Draft',
      sections: this.sections.map((sec: any, secIdx: number) => ({
        id: isEdit ? (sec.id || 0) : 0,                    // ── section id ──
        rowNumber: secIdx + 1,
        sectionName: sec.name,
        color: sec.color,
        fabricId: sec.fabricId != null ? Number(sec.fabricId) : null,
        sequence: secIdx + 1,
        totalPoQty: sec.totalPoQty,
        totalCutQty: sec.totalCutQty,
        grandTotalPlies: sec.grandTotalPlies,
        grandTotalGarments: sec.grandTotalGarments,
        totalDiff: sec.totalDiff,
        sizes: sec.sizes.map((sz: any) => ({
          id: isEdit ? (sz.id || 0) : 0,                   // ── size plan id ──
          sizeId: sz.sizeId,
          sizeName: sz.name,
          insertOrder: sz.insertOrder || 0,
          poQty: sz.poQty,
          cutQty: sz.cutQty,
          totalCalculated: sz.totalCalculated,
          diff: sz.diff,
          balanceQty: sz.cutQty - sz.totalCalculated
        })),
        lays: sec.lays.map((lay: any, idx: number) => ({
          id: isEdit ? (lay.id || 0) : 0,                  // ── lay id ──
          layNumber: idx + 1,
          inseam: lay.inseam || 'REG',
          shrinkage:    lay.shrinkage || '0X0%',
          markerName: lay.markerName,
          markerLength: lay.markerLength,
          markerAvg: lay.markerAvg,
          markerWidth: lay.markerWidth,
          reqFabric: lay.reqFabric,
          status: lay.status,
          plies: lay.plies,
          rowTotalRatio: lay.rowTotalRatio,
          totalPcs: lay.totalPcs,
          markerDiff: lay.markerDiff,
          breakdowns: sec.sizes.map((sz: any) => ({
            id: isEdit ? (lay.breakdownIds && lay.breakdownIds[sz.name]) || 0 : 0,  // ── breakdown id ──
            sizeId: sz.sizeId,
            sizeName: sz.name,
            insertOrder: sz.insertOrder || 0,
            ratio: lay.breakdown[sz.name] || 0,
            totalPcs: (lay.plies || 0) * (lay.breakdown[sz.name] || 0)
          }))
        }))
      }))
    }]
  };
}
  add() {

    console.log('API Payload:', this.buildApiPayload());
    this.spinner.show();
    this.http.post(`${environment.apiUrl}/api/ProductionCutting/AddCutting`, this.buildApiPayload())
      .subscribe(
        (res: any) => {
          this.response = res;
          if (this.response.success) {
            this.toastr.success('Cutting plan saved successfully.', 'Success');
            this.spinner.hide();
            this.cancle();
          } else {
            this.toastr.error(this.response.message, 'Message.');
            this.spinner.hide();
          }
        },
        (err: HttpErrorResponse) => {
          this.toastr.error('An error occurred while saving.', 'Error');
          console.error('Full error response:', err.error);   // ← ADD THIS
        console.error('Validation errors:', err.error?.errors); // ← ADD THIS
          this.spinner.hide();
        }
      );
  }

  update() {
    this.spinner.show();
    this.http.put(`${environment.apiUrl}/api/ProductionCutting/UpdateCutting`, this.data)
      .subscribe(
        (res: any) => {
          this.response = res;
          if (this.response.success) {
            this.toastr.success('Cutting plan updated successfully.', 'Success');
            this.spinner.hide();
            this.cancle();
          } else {
            this.toastr.error(this.response.message, 'Message.');
            this.spinner.hide();
          }
        },
        (err: HttpErrorResponse) => {
          this.toastr.error('An error occurred while updating.', 'Error');
          this.spinner.hide();
        }
      );
  }

   cancle(){
  this.router.navigate(['/production-cutting/cutting-master']);
 }
}
