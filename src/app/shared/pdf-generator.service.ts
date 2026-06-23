import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as JsBarcode from 'jsbarcode';

// Assign pdfMake to window object
(window as any).pdfMake = pdfMake;

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  constructor() {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs; // Set virtual file system for fonts
  }

  generateBarcodeImage(
    value: string,
    width: number = 1.5,
    height: number = 20
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, value, {
        format: 'CODE128',
        displayValue: true,
        width,
        height,
      });
      resolve(canvas.toDataURL('image/png'));
    });
  }

  async generatePDF(data: any[]) {
    const content: any[] = [];

    // Iterate over each bundle in data array
    for (let index = 0; index < data.length; index++) {
      const bundle = data[index];
      let bundleImages: any[] = []; // Reset bundleImages for each bundle
      try {
        const barcodeImage = await this.generateBarcodeImage(
          bundle.bundlebarcode,
          1,
          20
        );
        bundleImages.push({
          image: barcodeImage,
          width: 150,
          alignment: 'center',
          margin: [-300, 0],
        });

        // Add bundleImages as a row to content immediately after adding the bundle image
        content.push({
          columns: bundleImages,
          margin: [0, 10],
        });

        // Reset bundleImages for the child elements
        bundleImages = [];

        // Process bundle pieces
        for (const piece of bundle.bundlepices) {
          try {
            const pieceBarcodeImage = await this.generateBarcodeImage(
              piece.pice,
              1,
              20
            );

            bundleImages.push({
              image: pieceBarcodeImage,
              width: 150,
              alignment: 'center', // Center each piece barcode image
              margin: [0, 5], // Add some margin to the top
            });

            // Check if bundleImages has reached 5 images (one row)
            if (bundleImages.length === 5) {
              // Add bundleImages as a row to content
              content.push({
                columns: bundleImages,
                margin: [0, 10],
              });

              // Clear bundleImages for the next row
              bundleImages = [];
            }
          } catch (error) {
            console.error('Error generating piece barcode image:', error);
          }
        }

        // Add any remaining images in bundleImages as a new row
        if (bundleImages.length > 0) {
          content.push({
            columns: bundleImages,
            margin: [0, 10],
          });
        }

        // Add a margin-top after each bundle
        content.push({ text: '', margin: [0, 5] });
      } catch (error) {
        console.error('Error generating bundle barcode image:', error);
      }
    }

    // Create and open the PDF
    const documentDefinition = {
      pageOrientation: 'landscape' as const, // Set page orientation to landscape
      content: content,
    };
    pdfMake.createPdf(documentDefinition).open();
  }

  async generatePDFBarCodeCuttingBundle(data: any[]) {
    const content: any[] = [];
    let row: any[] = [];
    let barcodeCount = 0; // Track the number of barcodes added

    // Iterate over each item in the data array
    for (let index = 0; index < data.length; index++) {
        const item = data[index];

        // Generate barcode string and lines
        const barCodeString = `Cut: ${item.cut}, Size: ${item.size}, Bundle: ${item.bundle}, Qty: ${item.qty}, Shade: ${item.shade}, Shlik: ${item.shlik}`;
        const barcodeLines = [
          `${item.fullJobNumber}`,
          `${" "}`,
            `Cut:${'        '} ${item.h_Cut}`,
            `Size:${'       '} ${item.h_Size}`,
            `Bundle:${'   '} ${item.h_Bundle}`,
            `Qty:${'       '} ${item.h_Quantity}`,
            // `Shade:${'    '} ${item.h_Shad == null?'0':item.h_Shad}`,
            // `${'      '} ${item.h_Shrinkage ==null?'0':item.h_Shrinkage}`,
            `${''}`,
            `NUM ${'   '}  ${item.pieceRange}`,
        ];

        try {
            const barcodeImage = await this.generateBarcodeImage(
                item.barCodeString, // Use barCodeString to generate the barcode
                1,
                30
            );

            // Add barcode details and image to the row
            row.push({
                stack: [
                    ...barcodeLines.map(line => ({
                        text: line,
                        alignment: 'left',
                        margin: [20, 0,0,0],
                        fontSize: 8,
                        bold: true,
                    })),
                    {
                        image: barcodeImage,
                        width: 100,
                        alignment: 'left',
                        margin: [0, 10],
                    }
                ]
            });

            barcodeCount++;

            // Check if the row has 5 items or if it's the last item in the array
            if (row.length === 5 || index === data.length - 1) {
                content.push({
                    columns: row,
                    margin: [0, 10],
                });
                row = []; // Clear the row for the next set of items

                // Check if the page has reached 15 barcodes
                if (barcodeCount >= 25) {
                    content.push({ text: '', pageBreak: 'after' }); // Add a page break
                    barcodeCount = 0; // Reset the barcode counter for the new page
                }
            }
        } catch (error) {
            console.error('Error generating barcode image:', error);
        }
    }

    // Create and open the PDF
    const documentDefinition = {
        pageOrientation: 'portrait' as const, // Set page orientation to landscape
        content: content,
    };
    pdfMake.createPdf(documentDefinition).open();
}

async generatePDFBarCodeCuttingBundlePices(data: any[]) {
  const content: any[] = [];
  let row: any[] = [];

  // Iterate over each item in data array
  for (let index = 0; index < data.length; index++) {
      const item = data[index];

      try {
          const barcodeImage = await this.generateBarcodeImage(
              item.barCodeString, // Use barCodeString to generate the barcode
              1,
              30
          );

          // Add barcode image to the row
          row.push({
              image: barcodeImage,
              width: 150,
              alignment: 'center',
              margin: [0, 10],
          });

          // Check if the row has 5 images or if it's the last item in the array
          if (row.length === 5 || index === data.length - 1) {
              // Add the row to the content
              content.push({
                  columns: row,
                  margin: [0, 10],
              });
              // Clear the row for the next set of images
              row = [];
          }
      } catch (error) {
          console.error('Error generating barcode image:', error);
      }
  }

  // Create and open the PDF
  const documentDefinition = {
      pageOrientation: 'landscape' as const, // Set page orientation to landscape
      content: content,
  };
  pdfMake.createPdf(documentDefinition).open();
}

}