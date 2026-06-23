import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lay-spreading-report',
  templateUrl: './lay-spreading-report.component.html',
  styleUrls: ['./lay-spreading-report.component.css']
})
export class LaySpreadingReportComponent implements OnInit {

  headerId: number = 0;
  cutId: number    = 0;
  response: any;
// ── Add property ──
orderInfo: any = {
  productionCuttingHeaderNumber: '',
  jobNumber: '',
  customerName: '',
  styleName: '',
  colorName: '',
  articleName: '',
  cutNo: '',
  globalShade: ''
};
  // ── Report header ──
  report: any = {
    id:            0,
    reportDate:    new Date().toISOString().substring(0, 10),
    inspectorName: '',
    fabricRelax:   '',
    washUnwash:    '',
    remarks:       ''
  };
  image : any;
  image2 : any;
  jobNumber: string = '';

  // ── Lays from DB ──
  lays: any[] = [];

  // ── Entries (one per lay) ──
  entries: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
        this.http.get('/assets/fabicon-2-c.png', { responseType: 'blob' })
    .subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        var base64data = reader.result;                
            console.log(base64data);
            this.image2 = base64data;
      }
 
      reader.readAsDataURL(res); 
      console.log(res);
      this.image = res;
     
    });
    this.headerId = Number(this.route.snapshot.queryParamMap.get('headerId'));
    this.cutId    = Number(this.route.snapshot.queryParamMap.get('cutId'));
    if (this.cutId) this.load();
  }

  // ── Load existing report + lays ──
  load(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetLaySpreadingReport/${this.cutId}`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.lays = res.data.lays || [];
this.orderInfo = res.data.orderInfo || this.orderInfo; 
            if (res.data.report) {
              const r = res.data.report;
              this.report = {
                id:            r.id,
                reportDate:    r.reportDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
                inspectorName: r.inspectorName || '',
                fabricRelax:   r.fabricRelax   || '',
                washUnwash:    r.washUnwash     || '',
                remarks:       r.remarks        || ''
              };

              this.entries = this.lays.map((lay: any) => {
                const existing = r.entries?.find(
                  (e: any) => e.productionCuttingLayId === lay.id
                );
                return this.buildEntry(lay, existing);
              });
            } else {
              this.entries = this.lays.map((lay: any) =>
                this.buildEntry(lay, null)
              );
            }

            this.recalculateAll();
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.spinner.hide();
        },
        () => {
          this.toastr.error('Error loading report.', 'Error');
          this.spinner.hide();
        }
      );
  }

  // ── Build entry object for a lay ──
  buildEntry(lay: any, existing: any): any {
    return {
      id:                     existing?.id || 0,
      productionCuttingLayId: lay.id,
      layNumber:              lay.layNumber,
      markerName:             lay.markerName,
      shrinkage:              existing?.shrinkage  || lay.shrinkage  || '',
      layLength:              existing?.layLength  || lay.markerLength || 0,
      sectionName:            lay.sectionName,
      sectionColor:           lay.sectionColor,
      totalPlies:             lay.plies,
      rowTotalRatio:          lay.rowTotalRatio,
      fabricShortPlus:        existing?.fabricShortPlus || '',
      remarks:                existing?.remarks         || '',
      totalLayPlies:          0,
      totalCutQty:            0,
      totalFaults:            0,
      totalFabricUsed:        0,
      dhu:                    0,
      rolls: existing?.rolls?.length > 0
        ? existing.rolls.map((r: any) => this.mapRoll(r))
        : [this.newRoll(1)]
    };
  }

  // ── Map existing roll from API ──
  mapRoll(r: any): any {
    return {
      id:          r.id,
      srNo:        r.srNo,
      rollNo:      r.rollNo      || '',
      meters:      r.meters      || 0,
      shade:       r.shade       || '',
      plies:       r.plies       || 0,
      pliesSerial: r.pliesSerial || '',
      cutPcs:      r.cutPcs      || 0,
      fabricUsed:  r.fabricUsed  || 0,
      difference:  r.difference  || 0,
      missPick:    r.missPick    || 0,
      knots:       r.knots       || 0,
      fourPoints:  r.fourPoints  || 0,
      comments:    r.comments    || ''
    };
  }

  // ── Create empty roll ──
  newRoll(srNo: number): any {
    return {
      id:          0,
      srNo,
      rollNo:      '',
      meters:      0,
      shade:       '',
      plies:       0,
      pliesSerial: '',
      cutPcs:      0,
      fabricUsed:  0,
      difference:  0,
      missPick:    0,
      knots:       0,
      fourPoints:  0,
      comments:    ''
    };
  }

  // ── Add roll row ──
  addRoll(entry: any): void {
    entry.rolls.push(this.newRoll(entry.rolls.length + 1));
  }

  // ── Remove roll row ──
  removeRoll(entry: any, idx: number): void {
    entry.rolls.splice(idx, 1);
    entry.rolls.forEach((r: any, i: number) => r.srNo = i + 1);
    this.recalculateEntry(entry);
  }

  // ── Recalculate single entry ──
  recalculateEntry(entry: any): void {
    let totalPlies      = 0;
    let totalCutQty     = 0;
    let totalFaults     = 0;
    let totalFabricUsed = 0;

    entry.rolls.forEach((roll: any) => {
      totalCutQty += (roll.cutPcs || 0);

      if (roll.plies > 0) {
        roll.fabricUsed  = roll.meters > 0
          ? parseFloat(Number(roll.meters).toFixed(2))
          : 0;
        totalPlies      += roll.plies;
        totalFaults     += (roll.fourPoints || 0);
        totalFabricUsed += roll.fabricUsed;
      } else {
        roll.fabricUsed = 0;
      }
    });

    entry.totalLayPlies   = totalPlies;
    entry.totalCutQty     = totalCutQty;
    entry.totalFaults     = totalFaults;
    entry.totalFabricUsed = parseFloat(totalFabricUsed.toFixed(2));
    entry.dhu             = totalPlies > 0
      ? parseFloat((totalFaults / totalPlies * 100).toFixed(2))
      : 0;
  }

  // ── Recalculate all entries ──
  recalculateAll(): void {
    this.entries.forEach(e => this.recalculateEntry(e));
  }

  // ── Grand totals ──
  get grandTotalPlies(): number {
    return this.entries.reduce((s, e) => s + (e.totalLayPlies || 0), 0);
  }

  get grandTotalCutQty(): number {
    return this.entries.reduce((s: number, e: any) => s + (e.totalCutQty || 0), 0);
  }

  // ── Section grouping ──
  get sections(): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    this.entries.forEach(e => {
      if (!seen.has(e.sectionName)) {
        seen.add(e.sectionName);
        result.push(e.sectionName);
      }
    });
    return result;
  }

  getEntriesForSection(sectionName: string): any[] {
    return this.entries.filter(e => e.sectionName === sectionName);
  }

  // ── Validate ──
  validate(): boolean {
    for (const entry of this.entries) {
      const total = entry.rolls.reduce(
        (s: number, r: any) => s + (r.plies || 0), 0
      );
      if (total > entry.totalPlies) {
        this.toastr.error(
          `${entry.markerName}: Roll plies total (${total}) exceeds lay plies (${entry.totalPlies}).`,
          'Validation Error'
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
      id:                        this.report.id,
      productionCuttingHeaderId: this.headerId,
      productionCuttingCutId:    this.cutId,
      reportDate:                this.report.reportDate,
      inspectorName:             this.report.inspectorName,
      fabricRelax:               this.report.fabricRelax,
      washUnwash:                this.report.washUnwash,
      remarks:                   this.report.remarks,
      entries: this.entries.map(e => ({
        id:                     e.id,
        productionCuttingLayId: e.productionCuttingLayId,
        layNumber:              e.layNumber,
        markerName:             e.markerName,
        shrinkage:              e.shrinkage,
        layLength:              e.layLength,
        fabricShortPlus:        e.fabricShortPlus || '',
        remarks:                e.remarks         || '',
        rolls: e.rolls.map((r: any) => ({
          id:          r.id,
          srNo:        r.srNo,
          rollNo:      r.rollNo      || '',
          meters:      r.meters      || 0,
          shade:       r.shade       || '',
          plies:       r.plies       || 0,
          pliesSerial: r.pliesSerial || '',
          cutPcs:      r.cutPcs      || 0,
          difference:  r.difference  || 0,
          missPick:    r.missPick    || 0,
          knots:       r.knots       || 0,
          fourPoints:  r.fourPoints  || 0,
          comments:    r.comments    || ''
        }))
      }))
    };

    this.http
      .post(
        `${environment.apiUrl}/api/ProductionCutting/SaveLaySpreadingReport`,
        payload
      )
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.toastr.success('Lay spreading report saved successfully.', 'Success');
            this.load();
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.spinner.hide();
        },
        () => {
          this.toastr.error('Error saving report.', 'Error');
          this.spinner.hide();
        }
      );
  }

  // ── Back ──
  back(): void {
    this.router.navigate(['/production-cutting/cutting-master']);
  }

  // ══════════════════════════════════════════
  // PRINT LAY SPREADING REPORT PDF
  // ══════════════════════════════════════════
printLaySpreadingReport(): void {
  const content: any[] = [];

  // ── HEADER: Logo + Company + Doc Title ──
  content.push({
    columns: [
      {
        width: 'auto',
        stack: [
          this.image2
            ? { image: this.image2, fit: [30, 30], width: 42, margin: [0, 0, 0, 0] }
            : { text: '', width: 0 }
        ]
      },
      {
        width: '*',
        stack: [
          { text: 'FAB Industries (Pvt) Ltd.', style: 'companyName', margin: [10, 2, 0, 0] },
          { text: 'Lay Spreading Report', style: 'docTitle', margin: [10, 1, 0, 0] },
          { text: 'Quality Control Cutting', style: 'docSubtitle', margin: [10, 0, 0, 0] },
        ]
      },
      {
        width: 'auto',
        alignment: 'right',
      stack: [
        { text: this.orderInfo.productionCuttingHeaderNumber || '-', style: 'refValue' },
        { text: `WO-${this.orderInfo.jobNumber || '-'}`, style: 'refSub' },
        { text: this.orderInfo.styleName || '-', style: 'refSub' },
        { text: `(${this.orderInfo.colorName || '-'})`, style: 'refSub' },
        { text: `(${this.orderInfo.articleName || '-'})`, style: 'refSub' },
      ]
      }
    ],
    margin: [0, 0, 0, 10]
  });

  // ── Divider line under header ──
  content.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 802, y2: 0, lineWidth: 1.5, lineColor: '#1e293b' }],
    margin: [0, 0, 0, 12]
  });



// ── REPORT INFO CARD — add Customer & Article ──
content.push({
  table: {
    widths: ['16%', '34%', '16%', '34%'],
    body: [
      [
        { text: 'DATE', style: 'hdrLabel' },
        { text: this.report.reportDate || '-', style: 'hdrValue' },
        { text: 'INSPECTOR NAME', style: 'hdrLabel' },
        { text: this.report.inspectorName || '-', style: 'hdrValue' }
      ],
      [
        { text: 'FABRIC RELAX', style: 'hdrLabel' },
        { text: this.report.fabricRelax || '-', style: 'hdrValue' },
        { text: 'WASH/UNWASH', style: 'hdrLabel' },
        { text: this.report.washUnwash || '-', style: 'hdrValue' }
      ],
      [
        { text: 'REMARKS', style: 'hdrLabel' },
        { text: this.report.remarks || '-', style: 'hdrValue', colSpan: 3 },
        {}, {}
      ]
    ]
  },
  layout: {
    hLineWidth:    (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
    vLineWidth:    () => 0,
    hLineColor:    () => '#cbd5e1',
    vLineColor:    () => '#cbd5e1',
    paddingTop:    () => 5,
    paddingBottom: () => 5,
    paddingLeft:   () => 8,
    paddingRight:  () => 8,
    fillColor:     (rowIndex: number) => rowIndex % 2 === 0 ? '#f8fafc' : null
  },
  margin: [0, 0, 0, 14]
});

  // ── SECTIONS ──
  this.sections.forEach((secName: string, idx: number) => {
    if (idx > 0) content.push({ text: '', pageBreak: 'before' });

    const entriesForSec = this.getEntriesForSection(secName);
    const sectionColor  = entriesForSec[0]?.sectionColor || '#2563eb';

    // ── Section banner ──
    content.push({
      table: {
        widths: ['*'],
        body: [[
          {
            text: secName.toUpperCase(),
            style: 'sectionBanner',
            fillColor: sectionColor
          }
        ]]
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingTop: () => 5,
        paddingBottom: () => 5,
        paddingLeft: () => 10,
        paddingRight: () => 10
      },
      margin: [0, idx === 0 ? 0 : 6, 0, 8]
    });

    entriesForSec.forEach((entry: any) => {
      content.push(this.buildSpreadingTable(entry));
    });
  });

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [24, 24, 24, 36],
    pageOrientation: 'portrait',
    info: { title: `Lay Spreading Report - WO ${this.headerId}` },

    footer: (currentPage: number, pageCount: number) => ({
      margin: [24, 0, 24, 0],
      columns: [
        { text: 'FAB Industries (Pvt) Ltd. — Quality Control Cutting', style: 'footerText' },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
      ]
    }),

    content: content,

    styles: {
      companyName:  { fontSize: 16, bold: true, color: '#1e293b' },
      refValue: { fontSize: 13, bold: true, color: '#2563eb' },
  refSub:   { fontSize: 9, color: '#475569', margin: [0, 1, 0, 0] },
      docTitle:     { fontSize: 11, bold: true, color: '#2563eb' },
      docSubtitle:  { fontSize: 8, color: '#64748b' },
      refLabel:     { fontSize: 7, bold: true, color: '#94a3b8' },
      hdrLabel:     { fontSize: 7, bold: true, color: '#64748b' },
      hdrValue:     { fontSize: 8.5, bold: true, color: '#1e293b' },
      sectionBanner:{ fontSize: 11, bold: true, color: '#ffffff' },
      layLabel:     { fontSize: 8, bold: true, color: '#475569' },
      th:           { fontSize: 7, bold: true, alignment: 'center', color: '#475569', fillColor: '#f1f5f9' },
      td:           { fontSize: 7, alignment: 'center', color: '#334155' },
      tdLeft:       { fontSize: 7, alignment: 'left', color: '#334155' },
      totalCell:    { fontSize: 7.5, bold: true, alignment: 'center', color: '#1e293b', fillColor: '#e2e8f0' },
      footerText:   { fontSize: 7, color: '#94a3b8' }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}

// ── Build one lay's spreading table ──
buildSpreadingTable(entry: any): any {
  const headerRow1 = [
    { text: 'Sr#',          style: 'th' },
    { text: 'Roll #',       style: 'th' },
    { text: 'Meters',       style: 'th' },
    { text: 'Shade',        style: 'th' },
    { text: 'Plies',        style: 'th', fillColor: '#dbeafe' },
    { text: 'Plies Serial', style: 'th' },
    { text: 'Cut Pcs',      style: 'th', fillColor: '#dcfce7' },
    { text: 'Fabric Used',  style: 'th', fillColor: '#f3e8ff' },
    { text: 'Diff',         style: 'th' },
    { text: 'Miss Pick',    style: 'th' },
    { text: 'Knots',        style: 'th' },
    { text: '4 Points',     style: 'th', fillColor: '#fef3c7' },
    { text: 'Comments',     style: 'th' }
  ];

  const rows = entry.rolls.map((r: any, i: number) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
    return [
      { text: r.srNo,                                  style: 'td', fillColor: bg },
      { text: r.rollNo || '-',                          style: 'td', fillColor: bg },
      { text: r.meters || '-',                          style: 'td', fillColor: bg },
      { text: r.shade || '-',                           style: 'td', fillColor: bg },
      { text: r.plies || 0,                             style: 'td', fillColor: '#eff6ff', bold: true, color: '#1d4ed8' },
      { text: r.pliesSerial || '-',                     style: 'td', fillColor: bg },
      { text: r.cutPcs || 0,                            style: 'td', fillColor: '#f0fdf4', bold: true, color: '#15803d' },
      { text: r.fabricUsed ? r.fabricUsed + 'm' : '-',  style: 'td', fillColor: '#fdf4ff', color: '#7e22ce' },
      { text: r.difference || '-',                      style: 'td', fillColor: bg },
      { text: r.missPick || '-',                        style: 'td', fillColor: bg },
      { text: r.knots || '-',                           style: 'td', fillColor: bg },
      { text: r.fourPoints || '-',                      style: 'td', fillColor: '#fffbeb', color: '#b45309' },
      { text: r.comments || '-',                        style: 'tdLeft', fillColor: bg }
    ];
  });

  const totalRow = [
    { text: 'TOTAL', style: 'totalCell', colSpan: 4 }, {}, {}, {},
    { text: entry.totalLayPlies, style: 'totalCell', color: '#1d4ed8' },
    {},
    { text: entry.totalCutQty, style: 'totalCell', color: '#15803d' },
    { text: entry.totalFabricUsed + 'm', style: 'totalCell', color: '#7e22ce' },
    {}, {}, {},
    { text: entry.totalFaults, style: 'totalCell', color: '#b45309' },
    { text: 'DHU: ' + entry.dhu + '%', style: 'totalCell' }
  ];

  return {
    stack: [
      // ── Lay info strip ──
      {
        table: {
          widths: ['auto', '*', '*', '*', '*'],
          body: [[
            { text: entry.markerName, style: 'layBadge', fillColor: '#f59e0b', color: '#ffffff' },
            { text: `Section: ${entry.sectionName}`, style: 'layLabel' },
            { text: `Shrinkage: ${entry.shrinkage || '-'}`, style: 'layLabel' },
            { text: `Lay Length: ${entry.layLength}m`, style: 'layLabel' },
            { text: `Fabric Short/Plus: ${entry.fabricShortPlus || '-'}`, style: 'layLabel' }
          ]]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 5,
          paddingBottom: () => 5,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          fillColor: () => '#f8fafc'
        },
        margin: [0, 0, 0, 0]
      },
      {
        table: {
          headerRows: 1,
          widths: [20, 38, 36, 30, 30, 48, 34, 48, 24, 38, 28, 34, '*'],
          body: [headerRow1, ...rows, totalRow]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1'
        }
      }
    ],
    margin: [0, 0, 0, 14]
  };
}
}