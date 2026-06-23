import { style } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ServiceService } from 'src/app/shared/service.service';

(window as any).pdfMake = pdfMake;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  image: any;
  image2: any;
  index = 1;
  extreteddataarrayindex: any;
  articles: any = [];
  articleres: any;
  constructor(private http: HttpClient, private service: ServiceService) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

    this.http
      .get('/assets/FabIndustries-logo.png', { responseType: 'blob' })
      .subscribe((res) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          var base64data = reader.result;
          this.image2 = base64data;
        };
        reader.readAsDataURL(res);
        this.image = res;
      }); // Set virtual file system for fonts
  }
  generatePDFForMarOrder(printData: any) {
    let extreteddataarrayindex: any = {};
    const indexToRemove = printData.jobDetails.findIndex(
      (item: any) => item.fieldName === 'Wash / Colors'
    );

    if (indexToRemove !== -1) {
      // Remove the item from the array
      const [removedItem] = printData.jobDetails.splice(indexToRemove, 1);
      this.extreteddataarrayindex = removedItem;
    }
    else{
      this.extreteddataarrayindex ={
        fieldValue2: ''
      }
    }

    const sizeObjects = [
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
      { fieldName: '', fieldValue: 0, fieldValue2: '', totalCutting: 0 ,conShell1:0,conShell2:0,conShell3:0,liningCons:0},
    ];
 // ,conShell1:0,conShell2:0,conShell3:0,liningCons:0
    sizeObjects.forEach((obj, index) => {
      if (printData.jobDetails[index]) {
        parseInt(printData.jobDetails[index].fieldValue);
        Object.assign(obj, printData.jobDetails[index]);
      } else {
        obj.fieldName = '';
        obj.fieldValue = 0;
        obj.fieldValue2 = '';
      }
    });

    sizeObjects.forEach((obj: any) => {
      let varr = Math.round(
        (parseInt(obj.fieldValue) * printData.accessPercentage) / 100
      );
      obj.totalCutting = parseInt(obj.fieldValue) + varr;
    });

    const fieldNames = sizeObjects.map((item: any) => item.fieldName);
    const fieldValues = sizeObjects.map((item: any) => item.fieldValue);
    const fieldValues2 = sizeObjects.map((item: any) => item.fieldValue2);
    const fieldTotalcutting = sizeObjects.map((item: any) => item.totalCutting);
    const totalSumSizes = fieldValues.reduce((sum, value) => {
      // Convert value to a number if it's not already
      const numValue = parseFloat(value);
      // Check if the conversion is valid and add to the sum
      return !isNaN(numValue) ? sum + numValue : sum;
    }, 0);

    const adjustedValues = sizeObjects.map((item: any) => {
      const value = parseInt(item.fieldValue);
      const adjustedValue = (value * printData.accessPercentage) / 100;
      return Math.round(adjustedValue);
    });

    // Step 3: Sum the adjusted values
    const totalSumPer = adjustedValues.reduce((sum, value) => sum + value, 0);

    const totalcuttingsum = sizeObjects.map((item: any) => {
      const value = parseInt(item.fieldValue);
      const adjustedValue = (value * printData.accessPercentage) / 100;
      return Math.round(value + adjustedValue);
    });
    const totalcuttingsum1 = totalcuttingsum.reduce(
      (sum, value) => sum + value,
      0
    );
    const totalconShell1 = (totalSumSizes * printData.conShell) + (totalSumPer * printData.conShell)
    const totalconShell2 = (totalSumSizes * printData.conShell2) + (totalSumPer * printData.conShell2)
    const totalconShell3 = (totalSumSizes * printData.conShell3) + (totalSumPer * printData.conShell3)
    const totallinningCon = (totalSumSizes * printData.linningCon) + (totalSumPer * printData.linningCon)
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [15, 5, 5, 15],
      pageOrientation: 'landscape',
      info: {
        title: 'Order Sheet',
      },
      content: [
        {
          image: this.image2,
          fit: [160, 600],
        },
        {
          text: 'FAB INDUSTRIES PVT LTD',
          style: 'heading2',
          margin: [5, -30, 0, 0],
        },
        {
          margin: [0, 5, 0, 0],
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['100%'],
            body: [[{ text: 'Order Sheet', style: 'headingC' }]],
          },
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['7%', '15%', '7%', '15%', '7%', '15%', '7%', '15%'],
            body: [
              [
                {
                  text: 'S/C # :',
                  margin: [5, 10, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.scFullString,
                  margin: [0, 10, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Total Units # :',
                  margin: [0, 10, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  margin: [0, 10, 0, 0],
                  text:
                    printData.totalUnit +
                    ' ' +
                    printData.accessPercentage +
                    '% ' +
                    ((printData.totalUnit * printData.accessPercentage) / 100 +
                      printData.totalUnit),
                  style: 'common',
                },
                {
                  text: 'Job # : ',
                  margin: [0, 10, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.jobFullString,
                  margin: [0, 10, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Fabric Shell :',
                  margin: [0, 10, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.fabricShell,
                  margin: [0, 10, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['7%', '15%', '7%', '15%', '7%', '15%', '7%', '15%'],
            body: [
              [
                {
                  text: 'PO # : ',
                  margin: [5, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.poNumber,
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Cons Fabric :',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.linningFabric,
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Style Ref # :',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.styleReference,
                  margin: [0, 4, 0, 0],

                  style: 'common',
                },
                {
                  text: 'Date :',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.createdDateTime,
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },

        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['7%', '15%', '7%', '15%', '7%', '15%', '7%', '15%'],
            body: [
              [
                {
                  text: 'Cons Shell 1 : ',
                  margin: [5, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.conShell,
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Cons Shell 2 : ',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: 'Not Mapped',
                  margin: [0, 4, 0, 0],

                  style: 'common',
                },
                {
                  text: 'Cons Shell 3 : ',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: 'Not Mapped',
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Del Date : ',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.deliveryDate,
                  margin: [0, 4, 0, 0],

                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['7%', '15%', '7%', '15%', '7%', '15%', '7%', '15%'],
            body: [
              [
                {
                  text: 'Description : ',
                  margin: [5, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.scDescription,
                  margin: [0, 4, 0, 0],

                  style: 'common',
                },
                {
                  text: 'Lining Fabric : ',
                  margin: [0, 4, 0, 0],
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.linningCon,
                  margin: [0, 4, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['100%'],
            body: [
              [
                {
                  text: 'Detail as under',
                  margin: [5, 5, 0, 0],
                  bold: true,
                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            headerRows: 2,
            widths: [
              '15%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '6%',
              '6%',
              '6%',
              '6%',
              '6%',
              '6%',
            ],
            body: [
              [
                {
                  text: 'Wash/color',
                  rowSpan: 2,
                  margin: [0, 6, 0, 0],
                  style: 'tableHeader',
                },
                {
                  text: 'S               I               Z               E',
                  style: 'tableHeader',
                  colSpan: 11,
                },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                { text: '', style: 'tableHeader' },
                {
                  text: 'Total',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'ConShell1',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'ConShell2',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'ConShell3',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'liningCons',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
              ],
              [
                { text: '', style: 'tableHeader' },
                ...fieldNames.map((size: any) => ({
                  text: size,
                  style: 'tableHeader',
                })),
                { text: '', style: 'tableHeader' },
              ],

              [
                { text: 'PO # ' + printData.poNumber, style: 'tableHeader' },
                ...fieldValues.map((value: any) => ({
                  text: value,
                  style: 'tableHeader2',
                })),
                { text: totalSumSizes, style: 'tableHeader2' },
                { text: (totalSumSizes * printData.conShell).toFixed(2), style: 'tableHeader2' },
                { text: (totalSumSizes * printData.conShell2).toFixed(2), style: 'tableHeader2' },
                { text: (totalSumSizes * printData.conShell3).toFixed(2), style: 'tableHeader2' },
                { text: (totalSumSizes * printData.linningCon).toFixed(2), style: 'tableHeader2' },
              ],

              [
                {
                  text: 'With ' + printData.accessPercentage + ' % ',
                  style: 'tableHeader',
                },
                ...fieldValues.map((value: any) => ({
                  text: Math.round(
                    (parseInt(value) * printData.accessPercentage) / 100
                  ),
                  style: 'tableHeader2',
                })),
                { text: totalSumPer, style: 'tableHeader2' },
                { text: totalSumPer * printData.conShell, style: 'tableHeader2' },
                { text: totalSumPer * printData.conShell2, style: 'tableHeader2' },
                { text: totalSumPer * printData.conShell3, style: 'tableHeader2' },
                { text: totalSumPer * printData.linningCon, style: 'tableHeader2' },
              ],

              [
                {
                  text: this.extreteddataarrayindex.fieldValue2,
                  style: 'tableHeader',
                },
                ...fieldValues2.map((value2: any) => ({
                  text: value2,
                  style: 'tableHeader2',
                })),
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
              ],
              [
                { text: 'TOTAL Cutting', style: 'tableHeader' },
                ...fieldTotalcutting.map((value3: any) => ({
                  text: value3,
                  style: 'tableHeader2',
                })),
                { text: totalcuttingsum1, style: 'tableHeader2' },
                { text: totalconShell1.toFixed(1), style: 'tableHeader2' },
                { text: totalconShell2.toFixed(1), style: 'tableHeader2' },
                { text: totalconShell3.toFixed(1), style: 'tableHeader2' },
                { text: totallinningCon.toFixed(1), style: 'tableHeader2' },
              ],
            ],
          },
        },

        {
          margin: [0, 10, 0, 0],
          table: {
            headerRows: 2,
            widths: [
              '15%',
              '10%',
              '10%',
              '10%',
              '10%',
              '10%',
              '8%',
              '8%',
              '8%',
              '10%',
            ],
            body: [
              [
                {
                  text: 'ITEM',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'Size/Quantity/Instruction',
                  style: 'tableHeader',
                  colSpan: 5,
                },
                {},
                {},
                {},
                {},
                {
                  text: 'Quantity Per Pcs',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'Total Quantity',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'Grand Total',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
                {
                  text: 'Packing Instruction',
                  margin: [0, 6, 0, 0],
                  rowSpan: 2,
                  style: 'tableHeader',
                },
              ],
              // Section 1 - group1BeforeWashThread
              ...(printData.group1BeforeWashThread.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'BEFORE WASH Thread', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group1BeforeWashThread.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 2 - group2BeforeWashTrim
              ...(printData.group2BeforeWashTrim.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'BEFORE WASH Trim', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group2BeforeWashTrim.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 3 - group3AfterWashThread
              ...(printData.group3AfterWashThread.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'AFTER WASH Thread', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group3AfterWashThread.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 4 - group4AfterWashTrim
              ...(printData.group4AfterWashTrim.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'AFTER WASH Trim', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group4AfterWashTrim.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 5 - group5AccessoriesStitchingThread
              ...(printData.group5AcccessoriesStichingThread.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'ACCESSORIES STITCHING Thread', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group5AcccessoriesStichingThread.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 6 - group6AccessoriesStitchingTrim
              ...(printData.group6AccessoriesStitchingTrim.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'ACCESSORIES STITCHING Trim', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group6AccessoriesStitchingTrim.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 7 - group7FinishedStitchingThread
              ...(printData.group7AccessoriesFinishingThread.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'FINISHED STITCHING Thread', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group7AccessoriesFinishingThread.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, false] },
                      ];
                    }),
                  ]
                : []),
              // Section 8 - group8FinishedStitchingTrim
              ...(printData.group8AccessoriesFinishingTrim.length > 0
                ? [
                    [
                      { text: 'ITEM', style: 'tableHeader' },
                      { text: 'FINISHED STITCHING Trim', colSpan: 5, style: 'tableHeader' },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      
                    ],
                    ...printData.group8AccessoriesFinishingTrim.map((row: any) => {
                      let mul_TQ = totalcuttingsum1 * row.qtyPerPcs;
                      let GT = mul_TQ / parseInt(row.col4);
                      return [
                        { text: row.item, style: 'tableHeader2' },
                        { text: row.col1, style: 'tableHeader2' },
                        { text: row.col2, style: 'tableHeader2' },
                        { text: row.col3, style: 'tableHeader2' },
                        { text: row.col4, style: 'tableHeader2' },
                        { text: row.col5, style: 'tableHeader2' },
                        { text: row.qtyPerPcs, style: 'tableHeader2' },
                        { text: mul_TQ, style: 'tableHeader2' },
                        { text: Math.round(GT), style: 'tableHeader2' },
                        { text: this.index++, style: 'table_set', border: [true, false, true, true] },
                      ];
                    }),
                  ]
                : []),
            ],
            
          },
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['18%', '10%', '35%', '15%', '20%', '20%'],
            body: [
              [
                {
                  text: 'Prepared By',
                  margin: [90, 30, 0, 0],
                  style: 'common',
                },
                {
                  text: '_______________',
                  margin: [-61, 20, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Reviewed By Manager Marketing',
                  margin: [120, 30, 0, 0],
                  style: 'common',
                },
                {
                  text: '_____________________________________',
                  margin: [-162, 20, 0, 0],
                  style: 'common',
                },
                {
                  text: 'Product Manager',
                  margin: [15, 30, 0, 0],
                  style: 'common',
                },
                {
                  text: '____________________',
                  margin: [-151, 20, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },
      ],
      styles: {
        heading: {
          fontSize: 18,
          alignment: 'center',
        },
        heading2: {
          fontSize: 14,
          alignment: 'center',
        },
        headingC: {
          fontSize: 12,
          alignment: 'center',
        },
        subheading: {
          fontSize: 10,
          alignment: 'center',
        },
        common: {
          fontSize: 8,
        },
        tableHeader: {
          bold: true,
          fontSize: 7,
          color: 'black',
          alignment: 'center',
        },
        tableHeader2: {
          fontSize: 7,
          color: 'black',
          alignment: 'center',
        },
        table_set: {
          fontSize: 7,
          color: 'black',
        },
      },
    };
    pdfMake.createPdf(docDefinition).print();
  }
  generatePDFForMarCutting(printData: any) {
    console.log('Under', printData);
    function formatDate(dateString: any) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const month = monthNames[date.getMonth()]; // Get month name
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 10],
      pageOrientation: 'portrait',
      info: {
        title: 'Cutting Sheet',
      },

      content: [
        {
          image: this.image2,
          fit: [160, 600],
        },
        {
          text: 'FAB INDUSTRIES PVT LTD',
          style: 'heading',
          margin: [20, -28, 0, 0],
        },
        {
          text: 'Job # : ',
          margin: [440, -29, 0, 0],
          bold: true,
          style: 'common2',
        },
        {
          text:
            printData.jobFullString === null ? ' ' : printData.jobFullString,
          margin: [485, -9, 0, 0],
          style: 'common2',
        },
        {
          text: 'Cus : ',
          margin: [440, 3, 0, 0],
          bold: true,
          style: 'common2',
        },
        {
          text: printData.customerName,
          margin: [485, -8, 0, 0],
          style: 'common2',
        },
        {
          text: 'Open Date : ',
          margin: [440, 3, 0, 0],
          bold: true,
          style: 'common2',
        },
        {
          text: formatDate(printData.createdDateTime),
          margin: [485, -8, 0, 0],
          style: 'common2',
        },
        {
          text: 'Del Date : ',
          margin: [440, 3, 0, 0],
          bold: true,
          style: 'common2',
        },
        {
          text: 'Not Mapped',
          margin: [485, -8, 0, 0],
          style: 'common2',
        },
        {
          margin: [230, -12, 0, 0],
          layout: 'noBorders',
          table: {
            headerRows: 1,
            widths: ['40%'],
            body: [
              [
                {
                  text: 'Cutting Sheet' + ' ( ' + printData.session + ' )',
                  style: 'headingC',
                },
              ],
            ],
          },
        },
        {
          // layout: 'noBorders',
          margin: [5, 15, 0, 0],
          table: {
            headerRows: 1,
            widths: ['12%', '10%', '11%', '16%', '11%', '18%', '12%', '7%'],
            body: [
              [
                {
                  text: 'PO # : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.poNo,
                  style: 'common',
                },
                {
                  text: 'Brand : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.brand,
                  style: 'common',
                },
                {
                  text: 'ETC : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.etc,

                  style: 'common',
                },
                {
                  text: 'Over Cut :',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.overCut === 0 ? '' : printData.overCut,

                  style: 'common',
                },
              ],
            ],
          },
        },

        {
          margin: [5, 0, 0, 0],
          table: {
            headerRows: 1,
            widths: ['12%', '10%', '11%', '16%', '11%', '18%', '12%', '7%'],
            body: [
              [
                {
                  text: 'PC Avg (M) : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.pcAverage === 0 ? '' : printData.pcAverage,

                  style: 'common',
                },
                {
                  text: 'Article : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.articleName,
                  style: 'common',
                },

                {
                  text: 'Body Fabric : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.fabricBody,

                  style: 'common',
                },
                {
                  text: 'VMD Avg (Y) : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text:
                    printData.vmdAverage_Y === 0 ? '' : printData.vmdAverage_Y,
                  margin: [0, 0, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },

        {
          margin: [5, 0, 0, 0],
          table: {
            headerRows: 1,
            widths: ['12%', '10%', '11%', '16%', '11%', '18%', '12%', '7%'],
            body: [
              [
                {
                  text: 'Req Cut Qty : ',
                  bold: true,
                  style: 'common',
                },
                {
                  text: 'Not Mapped',

                  style: 'common',
                },
                {
                  text: 'PC Fabric : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.pcFabric,
                  margin: [0, 0, 0, 0],
                  style: 'common',
                },
                {
                  text: 'VMD Avg (M) :',

                  bold: true,
                  style: 'common',
                },
                {
                  text:
                    printData.vmdAverage_M === 0 ? '' : printData.vmdAverage_M,

                  style: 'common',
                },
                {
                  text: 'Act Cut QTY : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text:
                    printData.actualCutQunantity === 0
                      ? ''
                      : printData.actualCutQunantity,
                  margin: [0, 0, 0, 0],
                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          margin: [5, 0, 0, 0],
          table: {
            headerRows: 1,
            widths: ['12%', '10%', '11%', '16%', '11%', '18%', '12%', '7%'],
            body: [
              [
                {
                  text: 'PO Qty : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.poQuantity === 0 ? '' : printData.poQuantity,

                  style: 'common',
                },
                {
                  text: 'GGT Avg (M) : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text:
                    printData.ggT_Average === 0 ? '' : printData.ggT_Average,

                  style: 'common',
                },
                {
                  text: 'Differnce : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.diff === 0 ? '' : printData.diff,

                  style: 'common',
                },
                {
                  text: 'Wash : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: printData.wash,

                  style: 'common',
                },
              ],
            ],
          },
        },
        {
          margin: [5, 0, 0, 0],
          table: {
            headerRows: 1,
            widths: ['12%', '10%', '11%', '16%', '11%', '18%', '12%', '7%'],
            body: [
              [
                {
                  text: 'M Efficiency : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text:
                    printData.m_Efficiency === 0 ? '' : printData.m_Efficiency,

                  style: 'common',
                },
                {
                  text: 'Cons Avg (M) : ',

                  bold: true,
                  style: 'common',
                },
                {
                  text: 'Not Mapped',

                  style: 'common',
                },
              ],
            ],
          },
        },

        {
          margin: [5, 10, 0, 0],
          table: {
            headerRows: 1,
            widths: [
              '8%',
              '8%',
              '8%',
              '8%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '5%',
              '8%',
            ],

            body: [
              [
                { text: 'Cut-Qty', style: 'tableHeader', fillColor: '#e5eaee' },
                { text: 'Plies', style: 'tableHeader', fillColor: '#e5eaee' },
                { text: 'Cut #', style: 'tableHeader', fillColor: '#e5eaee' },
                {
                  text: 'Bdle Qty',
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col1Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col2Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col3Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col4Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col5Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col6Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col7Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col8Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col9Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col10Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                {
                  text: printData.cutHeader.col11Lable,
                  style: 'tableHeader',
                  fillColor: '#e5eaee',
                },
                { text: 'Total', style: 'tableHeader', fillColor: '#e5eaee' },
              ],
              [
                { text: 'Color', style: 'tableHeader', colSpan: 4 },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                {
                  text:
                    printData.cutHeader.col1Qty === '0'
                      ? ''
                      : printData.cutHeader.col1Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col2Qty === '0'
                      ? ''
                      : printData.cutHeader.col2Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col3Qty === '0'
                      ? ''
                      : printData.cutHeader.col3Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col4Qty === '0'
                      ? ''
                      : printData.cutHeader.col4Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col5Qty === '0'
                      ? ''
                      : printData.cutHeader.col5Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col6Qty === '0'
                      ? ''
                      : printData.cutHeader.col6Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col7Qty === '0'
                      ? ''
                      : printData.cutHeader.col7Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col8Qty === '0'
                      ? ''
                      : printData.cutHeader.col8Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col9Qty === '0'
                      ? ''
                      : printData.cutHeader.col9Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col10Qty === '0'
                      ? ''
                      : printData.cutHeader.col10Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                {
                  text:
                    printData.cutHeader.col11Qty === '0'
                      ? ''
                      : printData.cutHeader.col11Qty,
                  style: 'tableHeader2',
                  fillColor: '#e5eaee',
                },
                { text: '', style: 'tableHeader2' },
              ],
              [
                { text: 'Diff', style: 'tableHeader', colSpan: 4 },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                { text: '', style: 'tableHeader2' },
                {
                  text:
                    printData.cutHeader.col1Diff === '0'
                      ? ''
                      : printData.cutHeader.col1Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col2Diff === '0'
                      ? ''
                      : printData.cutHeader.col2Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col3Diff === '0'
                      ? ''
                      : printData.cutHeader.col3Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col4Diff === '0'
                      ? ''
                      : printData.cutHeader.col4Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col5Diff === '0'
                      ? ''
                      : printData.cutHeader.col5Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col6Diff === '0'
                      ? ''
                      : printData.cutHeader.col6Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col7Diff === '0'
                      ? ''
                      : printData.cutHeader.col7Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col8Diff === '0'
                      ? ''
                      : printData.cutHeader.col8Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col9Diff === '0'
                      ? ''
                      : printData.cutHeader.col9Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col10Diff === '0'
                      ? ''
                      : printData.cutHeader.col10Diff,
                  style: 'tableHeader2',
                },
                {
                  text:
                    printData.cutHeader.col11Diff === '0'
                      ? ''
                      : printData.cutHeader.col11Diff,
                  style: 'tableHeader2',
                },
                { text: '', style: 'tableHeader2' },
              ],

              ...printData.cutDetails.map((row: any) => [
                {
                  text: row.cutQuantity === 0 ? '' : row.cutQuantity,
                  style: 'tableHeader2',
                },
                {
                  text: row.piles === 0 ? '' : row.piles,
                  style: 'tableHeader2',
                },
                {
                  text: row.cutNo === 0 ? '' : row.cutNo,
                  style: 'tableHeader2',
                },
                {
                  text: row.bundleQty === 0 ? '' : row.bundleQty,
                  style: 'tableHeader2',
                },
                {
                  text: row.col1Value === 0 ? '' : row.col1Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col2Value === 0 ? '' : row.col2Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col3Value === 0 ? '' : row.col3Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col4Value === 0 ? '' : row.col4Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col5Value === 0 ? '' : row.col5Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col6Value === 0 ? '' : row.col6Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col7Value === 0 ? '' : row.col7Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col8Value === 0 ? '' : row.col8Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col9Value === 0 ? '' : row.col9Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col10Value === 0 ? '' : row.col10Value,
                  style: 'tableHeader2',
                },
                {
                  text: row.col11Value === 0 ? '' : row.col11Value,
                  style: 'tableHeader2',
                },
                { text: '', style: 'tableHeader2' },
              ]),
            ],
          },
        },
      ],

      styles: {
        heading: {
          fontSize: 18,
          alignment: 'center',
        },
        headingC: {
          fontSize: 14,
          alignment: 'center',
        },
        subheading: {
          fontSize: 14,
          alignment: 'center',
        },
        common: {
          fontSize: 8,
          // background:'#e5eaee'
          fillColor: '#e5eaee',
        },
        common2: {
          fontSize: 7,
        },
        tableHeader: {
          bold: true,
          fontSize: 9,
          color: 'black',
          alignment: 'center',
        },
        tableHeader2: {
          fontSize: 9,
          color: 'black',
          alignment: 'center',
        },
      },
    };
    pdfMake.createPdf(docDefinition).print();
  }
}
