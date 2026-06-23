import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-roll-register',
  templateUrl: './roll-register.component.html',
  styleUrls: ['./roll-register.component.css']
})
export class RollRegisterComponent implements OnInit {

  headerId: number = 0;
  cutId: number = 0;
  response: any;

  // ── Header info ──
  headerInfo: any = {};

  // ── Lays from DB (for assignment dropdown) ──
  availableLays: any[] = [];

  // ── Roll register data ──
  rolls: any[] = [];

  // ── Summary per lay (meters needed vs assigned) ──
  laySummary: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.headerId = Number(this.route.snapshot.queryParamMap.get('headerId'));
    this.cutId    = Number(this.route.snapshot.queryParamMap.get('cutId'));
    if (this.headerId) this.loadRollRegister();
  }

  // ── Load existing rolls + available lays ──
  loadRollRegister(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetRollRegister/${this.headerId}`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.availableLays = res.data.lays || [];
            this.buildLaySummary();

            if (res.data.rolls?.length > 0) {
              // Load existing rolls
              this.rolls = res.data.rolls.map((r: any) => ({
                id:             r.id,
                rollNo:         r.rollNo,
                meters:         r.meters,
                widthCm:        r.widthCm,
                shade:          r.shade,
                shrinkage:      r.shrinkage,
                remarks:        r.remarks,
                usedMeters:     r.usedMeters,
                balanceMeters:  r.balanceMeters,
                status:         r.status,
                layAssignments: r.layAssignments.map((a: any) => ({
                  id:                      a.id,
                  productionCuttingLayId:  a.productionCuttingLayId,
                  productionCuttingCutId:  a.productionCuttingCutId,
                  sectionName:             a.sectionName,
                  layNumber:               a.layNumber,
                  metersAssigned:          a.metersAssigned,
                  markerLength:            a.markerLength,
                  plies:                   a.plies,
                  usedMeters:              a.usedMeters,
                  wasteMeters:             a.wasteMeters
                }))
              }));
            } else {
              // Start with one empty roll
              this.addRoll();
            }

            this.recalculateAll();
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.spinner.hide();
        },
        () => {
          this.toastr.error('Error loading roll register.', 'Error');
          this.spinner.hide();
        }
      );
  }
get totalNeededMeters(): number {
  return parseFloat(
    this.laySummary
      .reduce((s: number, ls: any) => s + (ls.neededMeters || 0), 0)
      .toFixed(2)
  );
}

autoAssign(): void {
  this.rolls.forEach(r => r.layAssignments = []);

  // ── Sort lays by neededMeters DESC ──
  const laysToFill = this.laySummary
    .filter(ls => ls.neededMeters > 0 && ls.totalPlies > 0)
    .sort((a, b) => b.neededMeters - a.neededMeters)
    .map(ls => ({
      ...ls,
      remainingPlies:  ls.totalPlies,   // ── track by PLIES not meters ──
      remainingMeters: ls.neededMeters
    }));

  const rollsAvailable = this.rolls
    .filter(r => r.meters > 0)
    .sort((a, b) => b.meters - a.meters)
    .map(r => ({
      roll:           r,
      remainingMeters: r.meters
    }));

  for (const laySlot of laysToFill) {
    for (const rollSlot of rollsAvailable) {
      if (laySlot.remainingPlies <= 0) break;
      if (rollSlot.remainingMeters <= 0) continue;

      const markerLength = laySlot.markerLength;
      if (markerLength <= 0) continue;

      // ── How many plies can this roll give? ──
      const pliesFromRoll    = Math.floor(rollSlot.remainingMeters / markerLength);
      if (pliesFromRoll <= 0) continue;

      // ── Take only what we need ──
      const pliestoAssign    = Math.min(pliesFromRoll, laySlot.remainingPlies);
      const metersToAssign   = parseFloat((pliestoAssign * markerLength).toFixed(2));
      const usedMeters       = metersToAssign;
      const wasteMeters      = 0;  // exact plies × markerLength, no waste

      rollSlot.roll.layAssignments.push({
        id:                     0,
        productionCuttingLayId: laySlot.layId,
        productionCuttingCutId: this.cutId,
        sectionName:            laySlot.sectionName,
        layNumber:              laySlot.layNumber,
        metersAssigned:         metersToAssign,
        markerLength:           markerLength,
        plies:                  pliestoAssign,
        usedMeters:             usedMeters,
        wasteMeters:            wasteMeters
      });

      rollSlot.remainingMeters  = parseFloat((rollSlot.remainingMeters - metersToAssign).toFixed(2));
      laySlot.remainingPlies   -= pliestoAssign;
      laySlot.remainingMeters   = parseFloat((laySlot.remainingPlies * markerLength).toFixed(2));
    }
  }

  this.recalculateAll();
  this.toastr.success('Rolls auto-assigned. Please review and adjust if needed.', 'Auto Assign Complete');
}

confirmAutoAssign(): void {
  // Check if any assignments already exist
  const hasExisting = this.rolls.some(r => r.layAssignments?.length > 0);

  if (hasExisting) {
    if (!confirm(
      'This will clear all existing assignments and auto-assign from scratch. Continue?'
    )) return;
  }

  this.autoAssign();
}
  // ── Build lay summary (meters needed per lay) ──
 // ── Group lays by section ──
buildLaySummary(): void {
  this.laySummary = this.availableLays.map((lay: any) => ({
    layId:           lay.id,
    layNumber:       lay.layNumber,
    markerName:      lay.markerName,
    markerLength:    lay.markerLength,
    sectionName:     lay.sectionName,
    cutId:           lay.cutId,
    totalPlies:      lay.plies,
    neededMeters:    parseFloat((lay.plies * lay.markerLength).toFixed(2)),
    assignedMeters:  0,
    assignedPlies:   0,
    remainingMeters: 0,
    complete:        false
  }));
}

// ── Get unique sections in order ──
get sections(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  this.laySummary.forEach(ls => {
    if (!seen.has(ls.sectionName)) {
      seen.add(ls.sectionName);
      result.push(ls.sectionName);
    }
  });
  return result;
}

// ── Get lays for a section ──
getLaysForSection(sectionName: string): any[] {
  return this.laySummary.filter(ls => ls.sectionName === sectionName);
}

// ── Section needed meters ──
getSectionNeeded(sectionName: string): number {
  return parseFloat(
    this.getLaysForSection(sectionName)
      .reduce((s: number, ls: any) => s + (ls.neededMeters || 0), 0)
      .toFixed(2)
  );
}

// ── Section assigned meters ──
getSectionAssigned(sectionName: string): number {
  return parseFloat(
    this.getLaysForSection(sectionName)
      .reduce((s: number, ls: any) => s + (ls.assignedMeters || 0), 0)
      .toFixed(2)
  );
}

// ── Section complete check ──
getSectionComplete(sectionName: string): boolean {
  return this.getLaysForSection(sectionName)
    .filter(ls => ls.totalPlies > 0)
    .every(ls => ls.complete);
}
  // ── Recalculate lay summary from roll assignments ──
  recalculateAll(): void {
    // Reset summary
    this.laySummary.forEach(ls => {
      ls.assignedMeters  = 0;
      ls.assignedPlies   = 0;
    });

    // Sum assignments per lay
    this.rolls.forEach(roll => {
      (roll.layAssignments || []).forEach((asg: any) => {
        const ls = this.laySummary.find(s => s.layId === asg.productionCuttingLayId);
        if (ls) {
          ls.assignedMeters += asg.metersAssigned || 0;
          ls.assignedPlies  += asg.plies || 0;
        }
      });

      // Recalculate roll balance
      const totalUsed    = (roll.layAssignments || [])
        .reduce((s: number, a: any) => s + (a.metersAssigned || 0), 0);
      roll.usedMeters    = parseFloat(totalUsed.toFixed(2));
      roll.balanceMeters = parseFloat((roll.meters - totalUsed).toFixed(2));
    });

    // Update remaining
    this.laySummary.forEach(ls => {
      ls.remainingMeters = parseFloat((ls.neededMeters - ls.assignedMeters).toFixed(2));
      ls.complete        = ls.remainingMeters <= 0;
    });
  }

  // ── Add new roll ──
  addRoll(): void {
    this.rolls.push({
      id:             0,
      rollNo:         '',
      meters:         0,
      widthCm:        0,
      shade:          '',
      shrinkage:      '',
      remarks:        '',
      usedMeters:     0,
      balanceMeters:  0,
      status:         'Pending',
      layAssignments: []
    });
  }

  // ── Remove roll ──
  removeRoll(idx: number): void {
    this.rolls.splice(idx, 1);
    this.recalculateAll();
  }

  // ── Add lay assignment to roll ──
  addLayAssignment(roll: any): void {
    roll.layAssignments.push({
      id:                     0,
      productionCuttingLayId: null,
      productionCuttingCutId: this.cutId,
      sectionName:            '',
      layNumber:              0,
      metersAssigned:         0,
      markerLength:           0,
      plies:                  0,
      usedMeters:             0,
      wasteMeters:            0
    });
  }

  // ── Remove lay assignment ──
  removeLayAssignment(roll: any, idx: number): void {
    roll.layAssignments.splice(idx, 1);
    this.recalculateAll();
  }

  // ── When lay selected from dropdown ──
  onLaySelected(roll: any, asg: any): void {
    const lay = this.availableLays.find(l => l.id === asg.productionCuttingLayId);
    if (lay) {
      asg.sectionName            = lay.sectionName;
      asg.layNumber              = lay.layNumber;
      asg.markerLength           = lay.markerLength;
      asg.productionCuttingCutId = lay.cutId;
    }
    this.onMetersAssignedChange(roll, asg);
  }

  // ── When meters assigned changes — auto calc plies ──
  onMetersAssignedChange(roll: any, asg: any): void {
    if (asg.markerLength > 0 && asg.metersAssigned > 0) {
      asg.plies       = Math.floor(asg.metersAssigned / asg.markerLength);
      asg.usedMeters  = parseFloat((asg.plies * asg.markerLength).toFixed(2));
      asg.wasteMeters = parseFloat((asg.metersAssigned - asg.usedMeters).toFixed(2));
    } else {
      asg.plies       = 0;
      asg.usedMeters  = 0;
      asg.wasteMeters = 0;
    }
    this.recalculateAll();
  }

  // ── Get lay label for display ──
  getLayLabel(layId: number): string {
    const lay = this.availableLays.find(l => l.id === layId);
    return lay ? `${lay.markerName} (${lay.sectionName})` : '-';
  }

  // ── Validate before save ──
  validate(): boolean {
    for (const roll of this.rolls) {
      if (!roll.rollNo?.trim()) {
        this.toastr.error('Roll# is required for all rolls.', 'Validation');
        return false;
      }
      if (!roll.meters || roll.meters <= 0) {
        this.toastr.error(`Roll ${roll.rollNo}: Meters must be greater than 0.`, 'Validation');
        return false;
      }
      if (roll.balanceMeters < 0) {
        this.toastr.error(
          `Roll ${roll.rollNo}: Assigned meters (${roll.usedMeters}) exceed roll meters (${roll.meters}).`,
          'Validation'
        );
        return false;
      }
    }
    return true;
  }

  // ── Save ──
  save(): void {
    if (!this.validate()) return;

    this.spinner.show();
    const payload = {
      productionCuttingHeaderId: this.headerId,
      rolls: this.rolls.map(r => ({
        id:             r.id,
        rollNo:         r.rollNo,
        meters:         r.meters,
        widthCm:        r.widthCm || 0,
        shade:          r.shade || '',
        shrinkage:      r.shrinkage || '',
        remarks:        r.remarks || '',
        layAssignments: (r.layAssignments || [])
          .filter((a: any) => a.productionCuttingLayId && a.metersAssigned > 0)
          .map((a: any) => ({
            id:                     a.id,
            productionCuttingLayId: a.productionCuttingLayId,
            productionCuttingCutId: a.productionCuttingCutId,
            sectionName:            a.sectionName,
            layNumber:              a.layNumber,
            metersAssigned:         a.metersAssigned,
            markerLength:           a.markerLength
          }))
      }))
    };

    this.http
      .post(`${environment.apiUrl}/api/ProductionCutting/SaveRollRegister`, payload)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success('Roll register saved successfully.', 'Success');
            this.loadRollRegister();
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.spinner.hide();
        },
        () => {
          this.toastr.error('Error saving roll register.', 'Error');
          this.spinner.hide();
        }
      );
  }

  // ── Back to list ──
  back(): void {
    this.router.navigate(['/production-cutting/cutting-master']);
  }

  // ── Total meters of all rolls ──
  get totalRollMeters(): number {
    return parseFloat(this.rolls.reduce((s, r) => s + (r.meters || 0), 0).toFixed(2));
  }

  // ── Total assigned meters ──
  get totalAssignedMeters(): number {
    return parseFloat(this.rolls.reduce((s, r) => s + (r.usedMeters || 0), 0).toFixed(2));
  }

  // ── All lays complete ──
  get allLaysComplete(): boolean {
    return this.laySummary.every(ls => ls.complete);
  }
}