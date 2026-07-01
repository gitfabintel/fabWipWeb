import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { environment } from 'src/environments/environment';

import * as pdfMake  from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-style-bulletin',
  templateUrl: './style-bulletin.component.html',
  styleUrls: ['./style-bulletin.component.css']
})
export class StyleBulletinComponent implements OnInit {

  gridView:  any[] = [];
  gridData:  any[] = [];
  loadingIndicator = true;
  image:  any;
  image2: any;

  canAdd$!:    Observable<boolean>;
  canDelete$!: Observable<boolean>;

  constructor(
    private http:   HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private store:  Store,
  ) {}

  ngOnInit(): void {
    const perm$ = this.store.select(selectPermissionByMenu('IE Style Bulletin'));
    this.canAdd$    = perm$.pipe(map((p: any) => p?.canAdd    ?? false));
    this.canDelete$ = perm$.pipe(map((p: any) => p?.canDelete ?? false));

    // Load logo for PDF
    this.http.get('/assets/fabicon-2-c.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.image2 = reader.result;
        };
        reader.readAsDataURL(res);
        this.image = res;
      });

    this.get();
  }

  get(): void {
    this.loadingIndicator = true;
    this.http
      .get(`${environment.apiUrl}/api/WageStyleOperation/GetWageStyleOperationList`)
      .subscribe((res: any) => {
        if (res.success) {
          this.gridView = res.data;
          this.gridData = [...res.data];
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.loadingIndicator = false;
      }, () => {
        this.toastr.error('Failed to load style bulletins.', 'Error');
        this.loadingIndicator = false;
      });
  }

  onFilterField(value: string): void {
    const q = (value || '').toLowerCase();
    this.gridView = this.gridData.filter((d: any) =>
      !q ||
      (d.code         && d.code.toLowerCase().includes(q))         ||
      (d.customerName && d.customerName.toLowerCase().includes(q)) ||
      (d.articleName  && d.articleName.toLowerCase().includes(q))  ||
      (d.styleName    && d.styleName.toLowerCase().includes(q))
    );
  }

  add(): void {
    this.router.navigate(['/industrial-engineering/add-edit-style-bulletin'],
      { queryParams: { statusCheck: 'Add' } });
  }

  edit(row: any): void {
    this.router.navigate(['/industrial-engineering/add-edit-style-bulletin'],
      { queryParams: { statusCheck: 'Edit', PId: row.id } });
  }

  onDelete(row: any): void {
    if (!confirm(`Delete style bulletin "${row.code} — ${row.styleName}"?`)) return;
    this.http
      .delete(`${environment.apiUrl}/api/WageStyleOperation/DeleteWageStyleOperation/${row.id}`)
      .subscribe((res: any) => {
        if (res.success) { this.toastr.success(res.message); this.get(); }
        else this.toastr.error(res.message, 'Error');
      }, () => this.toastr.error('Failed to delete.', 'Error'));
  }

  print(row: any): void {
    this.loadingIndicator = true;
    this.http
      .get(`${environment.apiUrl}/api/WageStyleOperation/GetPrintData/${row.id}`)
      .subscribe((res: any) => {
        if (res.success) this.generatePDF(res.data);
        else this.toastr.error(res.message, 'Error');
        this.loadingIndicator = false;
      }, () => {
        this.toastr.error('Failed to load print data.', 'Error');
        this.loadingIndicator = false;
      });
  }

  generatePDF(data: any): void {
    const isApproved = data.approvedBy && data.approvedBy !== 'UnApproved';

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [30, 30, 30, 20],
      pageOrientation: 'portrait',
      info: { title: `Style Bulletin — ${data.customerName} / ${data.styleName}` },
      content: [

        // ── Header: logo left, company + title right ──────
        {
          columns: [
            {
              width: 50,
              stack: [
                this.image2
                  ? { image: this.image2, fit: [45, 45] }
                  : { text: '' }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'FabIndustries (Pvt) Ltd',          style: 'companyName' },
                { text: 'OPERATION PLANNING — STYLE BULLETIN', style: 'docTitle'    },
                isApproved
                  ? { text: 'Approved', style: 'approvedText' }
                  : { text: '' }
              ],
              margin: [10, 0, 0, 0]
            }
          ],
          margin: [0, 0, 0, 10]
        },

        // ── Divider ───────────────────────────────────────
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 0, 0, 8] },

        // ── Info row ──────────────────────────────────────
        {
          columns: [
            { text: `Customer: ${data.customerName}`, style: 'infoLabel', width: 'auto' },
            { text: `Article: ${data.articleName}`,   style: 'infoLabel', width: 'auto' },
            { text: `Style: ${data.styleName}`,       style: 'infoLabel', width: 'auto' },
            { text: `Effective: ${data.effectiveFrom}`, style: 'infoLabel', width: 'auto' },
          ],
          columnGap: 20,
          margin: [0, 0, 0, 12]
        },

        // ── Sections ──────────────────────────────────────
        ...(data.sections || []).map((sec: any, idx: number) => [
          { text: `${idx + 1}. ${sec.sectionName}`, style: 'sectionTitle', margin: [0, 6, 0, 3] },
          {
            table: {
              headerRows: 1,
              widths: [16, '*', 80, 32, 32, 36, 36, 38],
              body: [
                [
                  { text: '#',         style: 'th' },
                  { text: 'Operation', style: 'th' },
                  { text: 'Machine',   style: 'th' },
                  { text: 'M/C SMV',   style: 'th', alignment: 'right' },
                  { text: 'Non M/C',   style: 'th', alignment: 'right' },
                  { text: 'Total SAM', style: 'th', alignment: 'right' },
                  { text: 'Rate',      style: 'th', alignment: 'right' },
                  { text: 'Cost',      style: 'th', alignment: 'right' },
                ],
                ...(sec.operations || []).map((o: any, i: number) => {
                  const bg = i % 2 === 0 ? '#f7f7f7' : null;
                  return [
                    { text: o.sequenceNo,                          fillColor: bg, fontSize: 8 },
                    { text: o.operationName,                        fillColor: bg, fontSize: 8 },
                    { text: o.machineName || '—',                   fillColor: bg, fontSize: 8 },
                    { text: (o.mcSam    || 0).toFixed(3),           fillColor: bg, fontSize: 8, alignment: 'right' },
                    { text: (o.nonMcSam || 0).toFixed(3),           fillColor: bg, fontSize: 8, alignment: 'right' },
                    { text: (o.sAM || o.sam || 0).toFixed(3),       fillColor: bg, fontSize: 8, alignment: 'right' },
                    { text: (o.rate     || 0).toFixed(2),           fillColor: bg, fontSize: 8, alignment: 'right' },
                    { text: (o.cost     || 0).toFixed(2),           fillColor: bg, fontSize: 8, alignment: 'right' },
                  ];
                })
              ]
            },
            layout: {
              fillColor:  (r: number) => r === 0 ? '#e0e0e0' : null,
              hLineWidth: () => 0.4,
              vLineWidth: () => 0.4,
              hLineColor: () => '#bbbbbb',
              vLineColor: () => '#bbbbbb',
            },
            margin: [0, 0, 0, 3]
          },
          {
            columns: [
              { text: `Section SAM: ${(sec.totalSAM  || 0).toFixed(2)}`, fontSize: 8, bold: true, width: '*' },
              { text: `Rate: ${(sec.totalRate || 0).toFixed(2)}`,          fontSize: 8, bold: true, width: 'auto', alignment: 'right' },
              { text: `Cost: ${(sec.totalCost || 0).toFixed(2)}`,          fontSize: 8, bold: true, width: 100,   alignment: 'right' },
            ],
            margin: [0, 2, 0, 8]
          }
        ]).flat(),

        // ── Grand totals ──────────────────────────────────
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 4, 0, 6] },
        {
          columns: [
            { text: 'Grand Totals', style: 'sectionTitle', width: '*', alignment: 'center' },
            { text: `SAM: ${(data.grandTotalSAM  || 0).toFixed(2)}`,  bold: true, fontSize: 9, width: 120, alignment: 'right' },
            { text: `Rate: ${(data.grandTotalRate || 0).toFixed(2)}`,  bold: true, fontSize: 9, width: 100, alignment: 'right' },
            { text: `Cost: ${(data.grandTotalCost || 0).toFixed(2)}`,  bold: true, fontSize: 9, width: 100, alignment: 'right' },
          ],
          margin: [0, 0, 0, 24]
        },

        // ── Signatures ────────────────────────────────────
        {
          columns: ['PREPARED BY', 'CHECKED BY', 'APPROVED BY'].map((label, i) => ({
            stack: [
              {
                text: i === 0 ? (data.preparedBy || '') : i === 1 ? (data.checkedBy || '') : (data.approvedBy || ''),
                alignment: 'center', italics: true, fontSize: 8, color: '#555'
              },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 140, y2: 0, lineWidth: 0.8 }], alignment: 'center', margin: [0, 3, 0, 2] },
              { text: label, alignment: 'center', fontSize: 7, bold: true, color: '#333' }
            ],
            width: '33.3%'
          })),
          margin: [0, 10, 0, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => ({
        text: `Generated by FabIntel — Page ${currentPage} of ${pageCount}`,
        fontSize: 7, italics: true, color: '#888', alignment: 'center', margin: [0, 5, 0, 0]
      }),

      styles: {
        companyName:  { fontSize: 16, bold: true, color: '#003366' },
        docTitle:     { fontSize: 11, bold: true, color: '#007ACC', margin: [0, 2, 0, 0] },
        approvedText: { fontSize: 9,  bold: true, color: '#16a34a', margin: [0, 2, 0, 0] },
        infoLabel:    { fontSize: 9,  color: '#333333' },
        sectionTitle: { fontSize: 11, bold: true, color: '#005A9C' },
        th:           { bold: true, fontSize: 8, color: '#000', fillColor: '#e0e0e0' },
      },
      defaultStyle: { fontSize: 8, color: '#333' }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}