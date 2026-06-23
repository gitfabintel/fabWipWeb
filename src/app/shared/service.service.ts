import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
const CSV_TYPE = 'application/json;charset=utf-8';
const EXCEL_EXTENSION = '.xlsx';
const CSV_EXTENSION = '.csv';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { forkJoin, map } from 'rxjs';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  response: any;
  buyer: any = [];
  article: any = [];
  listCount: number | any;
  data: any = [];
    private readonly THEME_KEY = 'data-bs-theme';
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  fetch(cb: any, apiUrl2: any) {
    let desc = this;
    desc.http.get(`${environment.apiUrl}` + apiUrl2).subscribe({
      next: (res) => {
        this.response = res;
        if (this.response.data != null) {
          if (this.response.success == true) {
            this.listCount = this.response.data.length;
            desc.data = this.response.data;
            cb(this.data);
          } else {
            this.toastr.error(this.response.message, 'Message.');
          }
        }
        else{
          this.toastr.error(this.response.message, 'Message.');
        }
      },
      error: (err) => {
        if (err.status == 400) {
          this.toastr.error(err.error.message, 'Message');
        }
      },
    });
  }
 getCurrentTheme(): string {
    return localStorage.getItem(this.THEME_KEY) ?? 'light';
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  isDark(): boolean {
    return this.getCurrentTheme() === 'dark';
  }
  extractErrorMessagesFromErrorResponse(errorResponse: HttpErrorResponse) {
    // 1 - Create empty array to store errors
    const errors: any = [];

    // 2 - check if the error object is present in the response
    if (errorResponse.error) {
      // 4 - Check for Laravel form validation error messages object
      if (errorResponse.error.errors) {
        // 5 - For each error property (which is a form field)
        for (const property in errorResponse.error.errors) {
          if (errorResponse.error.errors.hasOwnProperty(property)) {
            // 6 - Extract it's array of errors
            const propertyErrors: Array<string> =
              errorResponse.error.errors[property];

            // 7 - Push all errors in the array to the errors array
            propertyErrors.forEach((error) => errors.push(error.split('|')));
          }
        }
      }
    }
    return errors;
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

    // Apply styles to the header row (1st row)
    const headerRow = worksheet['1'];
    for (const key in headerRow) {
      if (headerRow.hasOwnProperty(key)) {
        const cell = worksheet[key];
        cell.s = {
          font: { bold: true, size: 14 },
          fill: { bgColor: { indexed: 9 }, fgColor: { rgb: 'FFFF00' } },
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          }, // Add horizontal alignment and text wrapping
        };
      }
    }

    // Define column widths and add padding
    const columnWidths = [];
    for (const key in headerRow) {
      if (headerRow.hasOwnProperty(key)) {
        const columnLabel = key.replace(/[0-9]/g, ''); // Remove numbers from the key
        const headerText = headerRow[key].v;
        const columnWidth = Math.max(columnLabel.length, headerText.length) + 2; // Add some padding
        columnWidths.push({ wch: columnWidth });
      }
    }

    // Set the column widths
    worksheet['!cols'] = columnWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
  getActivities() {
    // Replace with your real API URLs
    
    const api1 = this.http.get<any>(`${environment.apiUrl}/api/ROGP/GetROGPHeaderList/${"null"}/${"null"}`);
    const api2 = this.http.get<any>(`${environment.apiUrl}/api/OGP/GetOGPHeaderList/${"null"}/${"null"}`);

return forkJoin([api1, api2]).pipe(
      map(([res1, res2]) => {
        const today = new Date();

        // Format today into "DD-MMM-YYYY"
        const todayStr = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).replace(/ /g, '-'); // e.g. "21-Aug-2025"
 const list1 = res1.data || [];
    const list2 = res2.data || [];
        const merged = [...list1, ...list2]
          // ✅ keep only today's records
          .filter(item => item.createdDateTime === todayStr);

        return merged;
      })
    );
  }
  GetYears() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetYears`);
  }

  GetCustomerList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCustomerList`);
  }
  GetArticleList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetArticleList`);
  }
  GetUserTypes() {
    return this.http.get(`${environment.apiUrl}/api/UserType/GetAllUserType`);
  }

  GetCity(ProId:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCities/`+ProId);
  }

  GetProvance() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetProvinces`);
  }
  GetUOM() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetUOM`);
  }

   GetFabricTypes() {
    return this.http.get(`${environment.apiUrl}/api/FabricTypes/GetFabricTypesList`);
  }
   GetYarnTypes() {
    return this.http.get(`${environment.apiUrl}/api/YarnTypes/GetYarnTypesList`);
  }

    GetFibers() {
    return this.http.get(`${environment.apiUrl}/api/Fibers/GetFibersList`);
  }

     GetFinishTypes() {
    return this.http.get(`${environment.apiUrl}/api/FinishTypes/GetFinishTypesList`);
  }

       GetSpecialFinishTypes() {
    return this.http.get(`${environment.apiUrl}/api/SpecialFinishTypes/GetSpecialFinishTypesList`);
  }

        GetFabricColors() {
    return this.http.get(`${environment.apiUrl}/api/FabricColor/GetFabricColorList`);
  }


   GetaccountSystemLists() {
    return this.http.get(`${environment.apiUrl}/api/SystemAccounts/GetSystemAccountsList`);
  }

     GetSubLedgerTypesList() {
    return this.http.get(`${environment.apiUrl}/api/SubLedgerTypes/GetSubLedgerTypesList`);
  }

       GetTaxCodeList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetTaxCodeList`);
  }

         GetTaxCOACodeList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetTaxCOACodeList`);
  }


       GetcontrolAccountsList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevel3`);
  }
  GetLocation() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetLocation`);
  }

    GetCOALevel3s() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevel3`);
  }
  GetPONumber() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberList`);
  }

  GetPONumberBom() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberBOMList`);
  }
  GetjobSummaries() {
    return this.http.get(`${environment.apiUrl}/api/Report/DashBoardJobProgress`);
  }
  GetJobNumberForBOMNumber() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberForBomList`);
  }

  GetPONumbers() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPoNumberList`);
  }

    GetJobNumberWithTrim() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberWithTrimList`);
  }

  GetPO() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPOList`);
  }
  GetIGPType() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetIGPType`);
  }
  GetPOTypeList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPOType`);
  }

  GetPricestandingList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPriceStanding`);
  }

  GetPaymentTermsList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPaymentTerm`);
  }

  GetCOMainCodeList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOAMainCodeList`);
  }

    GetSubledgerLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetSubledger`);
  }
  GetJobNumber() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberList`);
  }

    OperationSectionList() {
    return this.http.get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`);
  }
  OperationList() {
    return this.http.get(`${environment.apiUrl}/api/WageOperation/GetWageOperationList`);
  }
 machinesList() {
    return this.http.get(`${environment.apiUrl}/api/WageMachice/GetWageMachiceList`);
  }

   GetJobNumberApprovedBomLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberApprovedBomList`);
  }
    GetMIRList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetMIRList`);
  }
  GetMainStoreList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemMainStoreList`);
  }
  GetItemGroupList(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemGroupList/`+id);
  }
  GetVendorList(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetVendorListByCodeId/`+id);
  }
  GetSubStoreList(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemSubStoreList/`+id);
  }

  GetPOCOVList(data:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPOListByCoaMainCodeIdAndVendorId/`+data.coaCodeId +'/'+ data.vendorId);
  }

  GetPRByID(id:any) {
    return this.http.get(`${environment.apiUrl}/api/PurchaseRequisition/GetPurchaseRequisitionByIdForPO/`+id);
  }
  GetPOByID(id:any) {
    return this.http.get(`${environment.apiUrl}/api/PurchaseOrder/GetPurchaseOrderDetailById/`+id);
  }
  GetPOByIDIGPFabric(id:any) {
    return this.http.get(`${environment.apiUrl}/api/PurchaseOrder/GetPurchaseOrderDetailForIGPById/`+id);
  }
  GetItemInStock(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemInStock/`+id);
  }
  GetPRList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPurchaseRequistionList`);
  }
  PR() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPRList`);
  }
  GetJob() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobNumberList`);
  }
  GetpurchaserList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPurchaseRequistionWithItemList`);
  }
  GetpurchaserDropdownsList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPurchaserList`);
  }
  GetDepartment() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetDepartmentList`);
  }

    GetCOAlevel3of5Lists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevel3of5`);
  }
  GetLocalParty() {
    return this.http.get(`${environment.apiUrl}/api/Party/GetPartyList`);
  }
  
  GetCurrencyLists() {
    return this.http.get(`${environment.apiUrl}/api/CurrencyAcc/GetCurrencyAccList`);
  }
   GetVoucherTypeLists() {
    return this.http.get(`${environment.apiUrl}/api/VoucherTypes/GetVoucherTypeList`);
  }

  GetFyearLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetFYearList`);
  }

    GetGLHeadLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetGL3rdLevelList`);
  }

      GetGLHead4rdLevelLists(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetLevel4AccountsByLevel3/`+id);
  }

   GetCurrencyACCLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCurrencyVoucherList`);
  }


   GetUserLists() {
    return this.http.get(`${environment.apiUrl}/api/User/GetAllUsers`);
  }

    GetUserList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetUserList`);
  }
 GetNotesLists() {
    return this.http.get(`${environment.apiUrl}/api/SystemAccounts/GetSystemAccountsList`);
  }


     GetCOALevel4WithSubLedgers() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevel4WithSubLedger`);
  }
     GetCOALevel4(level:any ) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevel4/${level}`);
  }

     GetSubledgerFiltered(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetSubledgerFiltered/`+id);
  }

     GetBringChilds(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCOALevelChild/`+id);
  }


       GetSubLedgerLists() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetSubledger`);
  }

    Getbspllists() {
    return this.http.get(`${environment.apiUrl}/api/BSPLType/GetBSPLTypeList`);
  }

     Getacfamilylists() {
    return this.http.get(`${environment.apiUrl}/api/AccountType/GetAccountTypeList`);
  }

   GetDepartmentGeneric(level:any, departmentId:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetDepartmentListByLevel/${level}/${departmentId}`);
  }

    GetTTypeList() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetJobTransType`);
  }

      GetCustomer() {
    return this.http.get(`${environment.apiUrl}/api/Customer/GetCustomerList`);
  }

       GetCustomerArticle(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCustomerArticleLookup/${id}`);
  }

     GetCustomerStyle(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCustomerStyleLookup/${id}`);
  }

      GetCustomerColor(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCustomerColorsLookup/${id}`);
  }
  GetZipperDropdown() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemCodeListForZipper`);
  }

  GetTrims(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetTrimListByJobId/`+id);
  }
   GetCodeByTrims(idss:any) {
    //  const idsString = ids.join(',');

    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemListByTrimId/`+idss);
  }
  GetBom(value:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetBOMListByJobId/`+value);
  }

  GetBomSizes(value:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetSizeListByBomId/`+value);
  }
  Getsize(value:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetSizes/` + value);
  }
  GetItemCode() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemCodeList`);
  }

    GetSectionLists() {
    return this.http.get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`);
  }

   glCodeList() {
    return this.http.get(`${environment.apiUrl}/api/GLAccountCode/GetAllGLAccountCode`);
  }

    GetFOCNOR() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetFOCNormalType`);
  }
      GetIssueTypeList() {
    return this.http.get(`${environment.apiUrl}/api/IssueType/GetIssueTypeList`);
  }
  GetItemCodeRigerter(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemCodeList/`+id);
  }
  GetItemCodeR() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemMainStoreList`);
  }
  GetPR() {
    return this.http.get(`${environment.apiUrl}/api/PurchaseRequisition/GetPurchaseRequisitionList`);
  }
  GetIGP() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetIGPList`);
  }

   GetIGPDetailVendorFOrGrn(id:any) {
    return this.http.get(`${environment.apiUrl}/api/IGP/GetIGPDetailByFORGRNId/`+id);
  }
  GetPartyList () {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetPartyList`);
  }

  GetVendosList () {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetVendorList`);
  }

   GetROGPList () {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetROGPList`);
  }
  GetJobTypeList() {
    return this.http.get(`${environment.apiUrl}/api/JobType/GetAllJobType`)
  }
  GetMonths() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetMonths`);
  }
  Getcategory() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetCategory`);
  }

  Getproduct() {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetProducts`);
  }
  Getbranch() {
    return this.http.get(`${environment.apiUrl}/api/Branch/GetAllBranch`);
  }
  GetbranchTaxes() {
    return this.http.get(`${environment.apiUrl}/api/Tax/GetAllTax`);
  }

  Getservicecharges() {
    return this.http.get(
      `${environment.apiUrl}/api/ServiceCharges/GetAllServiceCharges`
    );
  }
  GetcategoryPOS() {
    return this.http.get(`${environment.apiUrl}/api/Category/GetAllCategory`);
  }

  GetAllitemPOS() {
    return this.http.get(
      `${environment.apiUrl}/api/Product/GetAllProductForPos`
    );
  }
  GetSizeListByCutDetailID(id:any) {
      return this.http.get(`${environment.apiUrl}/api/Cut/GetSizeListByCutDetailID/`+id)
    }

    GetDashboardPRINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/PurchaseRequisition/GetPurchaseRequisitionTracking/`+id)
    }

       GetDashboardVoucherINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/Voucher/GetVoucherTracking/`+id)
    }

       GetDashboardPOINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/PurchaseOrder/GetPurchaseOrderTracking/`+id)
    }

           GetDashboardBomINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/BOM/GetBomTracking/`+id)
    }
        GetDashboardSinINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/SIN/GetSINTracking/`+id)
    }

         GetDashboardMmcINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/BOM/GetBomMMCTracking/`+id)
    }

         GetDashboardGRNINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/GRN/GetGRNTracking/`+id)
    }
    GetBundleListBySize(id:any,ColName:any) {
      return this.http.get(`${environment.apiUrl}/api/Cut/GetBundleListBySize/`+id +'/'+ ColName)
    }

    
       GetDashboardOGPINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/OGP/GetOGPTracking/`+id)
    }

           GetDashboardOGPRINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/ROGP/GetROGPTracking/`+id)
    }
               GetDashboardIGPINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/IGP/GetIGPTracking/`+id)
    }

                  GetDashboardIGPROGPINFO(id:any) {
      return this.http.get(`${environment.apiUrl}/api/IGP_ROG_ROGP/GetIGP_ROGTracking/`+id)
    }
 GetItemByJOB(id:any) {
    return this.http.get(`${environment.apiUrl}/api/Lookup/GetItemCodeListByJobId/`+id);
  }

  GetStyleData(id:any) {
    return this.http.get(`${environment.apiUrl}/api/StyleTemplateMaster/GetStyleTemplateMasterById/`+id);
  }

    GetStyleDataBOM(id:any) {
    return this.http.get(`${environment.apiUrl}/api/StyleTemplateMaster/GetStyleTemplateMasterFORBOMBYSTYLEById/`+id);
  }

   getPOByGrnId(id:any) {
    return this.http.get(`${environment.apiUrl}/api/PurchaseOrder/GetPurchaseOrderPrintViewById/`+id);
  }
     getIGPByGrnId(id:any) {
    return this.http.get(`${environment.apiUrl}/api/IGP/GetIGPPrintViewById/`+id);
  }
     getGRNById(id:any) {
    return this.http.get(`${environment.apiUrl}/api/GRN/GetGRNPrintViewById/`+id);
  }

async exportAsStockExcelFileSummaryIssueRigesterDetails(data: any[], fileName: string, mainInfo: any): Promise<void> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Issue Register Detail");

  // ===== Header Section =====
  worksheet.addRow(["FabIndustries (Pvt) Ltd"]).font = { bold: true, size: 14 };
  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.addRow(["Issue Register Detail"]).font = { bold: true, size: 12 };
  worksheet.mergeCells("A2:H2");
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.addRow([
    `Date From: ${mainInfo.startDate} To: ${mainInfo.endDate} | Item: ${mainInfo.itemname} - ${mainInfo.stockValue}`,
  ]);
  worksheet.mergeCells("A3:H3");
  worksheet.getCell("A3").alignment = { horizontal: "center" };

  worksheet.addRow([]); // spacing

  // ===== Table Header =====
  const headerRow = [
    "Sr#", "Item Name", "Full Item Code",
    "Job No", "Unit", "Rate",
    "Qty Issued", "Cost Value"
  ];
  worksheet.addRow(headerRow);

  // ===== Style Header Row =====
  const header = worksheet.getRow(5);
  header.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };
  });

  // ===== Data and Totals =====
  let grandTotal = 0;
  let currentRow = 6;

  (data || []).forEach((main: any) => {
    let mainStoreTotal = 0;

    // Main Store Header
    const mainStoreRow = worksheet.addRow([`Main Store: ${main.mainStoreName} (${main.mainStore})`]);
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    mainStoreRow.font = { bold: true, size: 10 };
    mainStoreRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F2FF" } };
    currentRow++;

    (main.subStores || []).forEach((sub: any) => {
      let subStoreTotal = 0;

      // Sub Store Header
      const subStoreRow = worksheet.addRow([`Sub Store: ${sub.subStoreName} (${sub.subStore})`]);
      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      subStoreRow.font = { bold: true, size: 10 };
      subStoreRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
      currentRow++;

      (sub.itemGroups || []).forEach((group: any) => {
        let groupTotal = 0;

        // Item Group Header
        const groupRow = worksheet.addRow([`Item Group: ${group.itemGroupName} (${group.itemGroup})`]);
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        groupRow.font = { bold: true, size: 10 };
        groupRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9F9F9" } };
        currentRow++;

        // Item Rows
        (group.items || []).forEach((row: any, i: number) => {
          const costValue = row.costValue ?? 0;
          const rate = row.rate ?? 0;
          const qty = row.quantityIssued ?? 0;

          groupTotal += costValue;
          subStoreTotal += costValue;
          mainStoreTotal += costValue;
          grandTotal += costValue;

          worksheet.addRow([
            i + 1,
            row.itemName || "",
            row.fullItemCode || "",
            row.jobNumber || "",
            row.unit || "",
            rate.toFixed(2),
            row.returnQuantity && row.returnQuantity !== 0
    ? `${qty.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n(Return: ${row.returnQuantity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    : qty.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            costValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          ]);
          currentRow++;
        });

        // Group Total Row
        const groupTotalRow = worksheet.addRow([
          `Item Group (${group.itemGroupName}) Total`, "", "", "", "", "", "",
          groupTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        ]);
        worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
        groupTotalRow.font = { bold: true };
        groupTotalRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F3F3" } };
        currentRow++;
      });

      // Sub Store Total Row
      const subStoreTotalRow = worksheet.addRow([
        `Sub Store (${sub.subStoreName}) Total`, "", "", "", "", "", "",
        subStoreTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      ]);
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      subStoreTotalRow.font = { bold: true };
      subStoreTotalRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAEAEA" } };
      currentRow++;
    });

    // Main Store Total Row
    const mainTotalRow = worksheet.addRow([
      `Main Store (${main.mainStoreName}) Total`, "", "", "", "", "", "",
      mainStoreTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ]);
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    mainTotalRow.font = { bold: true };
    mainTotalRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };
    currentRow++;
  });

  // Grand Total Row
  const grandTotalRow = worksheet.addRow([
    "GRAND TOTAL", "", "", "", "", "", "",
    grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]);
  worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
  grandTotalRow.font = { bold: true };
  grandTotalRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCFCFCF" } };

  // ===== Column Widths =====
  worksheet.columns = [
    { width: 8 },
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 15 },
  ];

  // ===== Save File =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  fs.saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}


async exportAsStockExcelFileDetailsIssueOnGrouping(data: any[], fileName: string, mainInfo: any): Promise<void> {
 const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('GL Head Wise Consumption Detail');

  // ===== Report Header =====
  worksheet.addRow(['FabIndustries (Pvt) Ltd']).font = { bold: true, size: 14 };
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.addRow(['G/L Head Wise Consumption Detail']).font = { bold: true, size: 12 };
  worksheet.mergeCells('A2:F2');
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.addRow([
    `Date From: ${mainInfo.startDate} To: ${mainInfo.endDate} | Item: ${mainInfo.itemname} - ${mainInfo.stockValue}`
  ]);
  worksheet.mergeCells('A3:F3');
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  worksheet.addRow([]); // spacing

  // ===== Header Rows =====
  worksheet.addRow([
    'Sr.', 'Item Group No.', 'Item Group Name', 'Quantity', 'Avg. Rate', 'Issue Amount'
  ]).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // ===== Table Body =====
  let grandTotal = 0;
  let grandTotalQty = 0;

  data.forEach((gl: any, glIndex: number) => {
    let glTotalQty = 0;
    let glTotalAmount = 0;

    // 🔹 G/L Header Row
    const glHeaderRow = worksheet.addRow([`G/L: ${gl.glName} (${gl.glCode})`]);
    worksheet.mergeCells(`A${glHeaderRow.number}:F${glHeaderRow.number}`);
    glHeaderRow.font = { bold: true, size: 10 };
    glHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F2FF' }
    };

    // 🔹 Items
    gl.level3Summaries.forEach((item: any, i: number) => {
      const qty = item.totalQuantity || 0;
      const rate = item.avgRate || 0;
      const amt = item.totalAmount || 0;

      glTotalQty += qty;
      glTotalAmount += amt;
      grandTotalQty += qty;
      grandTotal += amt;

      const row = worksheet.addRow([
        i + 1,
        item.codeSubString || '-',
        item.name || '',
        qty,
        rate,
        amt
      ]);

      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'left' };
      row.getCell(4).alignment = { horizontal: 'right' };
      row.getCell(5).alignment = { horizontal: 'right' };
      row.getCell(6).alignment = { horizontal: 'right' };

      row.getCell(4).numFmt = '#,##0.00';
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(6).numFmt = '#,##0.00';
    });

    // 🔹 Subtotal Row
    const totalRow = worksheet.addRow([
      `TOTAL (${gl.glName})`, '', '',
      glTotalQty, '-', glTotalAmount
    ]);
    worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`);

    totalRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDDDDD' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    totalRow.getCell(4).numFmt = '#,##0.00';
    totalRow.getCell(6).numFmt = '#,##0.00';
  });

  // ===== Grand Total Row =====
  const grandRow = worksheet.addRow([
    'GRAND TOTAL', '', '',
    grandTotalQty, '-', grandTotal
  ]);
  worksheet.mergeCells(`A${grandRow.number}:C${grandRow.number}`);

  grandRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCFCFCF' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  grandRow.getCell(4).numFmt = '#,##0.00';
  grandRow.getCell(6).numFmt = '#,##0.00';

  // ===== Column Widths =====
  worksheet.columns = [
    { width: 6 },  // Sr.
    { width: 12 }, // No.
    { width: 35 }, // Name
    { width: 12 }, // Qty
    { width: 12 }, // Rate
    { width: 16 }, // Amount
  ];

  // ===== Save File =====
  const buffer = await workbook.xlsx.writeBuffer();
  fs.saveAs(new Blob([buffer]), `${fileName}.xlsx`);
}
async exportAsStockExcelFileSummaryIssueOnGrouping(data: any[], fileName: string, mainInfo: any): Promise<void> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("GL Head Wise Consumption Summary");

  // ===== Header Section =====
  worksheet.addRow(["FabIndustries (Pvt) Ltd"]).font = { bold: true, size: 14 };
  worksheet.mergeCells("A1:C1");
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.addRow(["G/L Head Wise Consumption Summary"]).font = { bold: true, size: 12 };
  worksheet.mergeCells("A2:C2");
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.addRow([
    `Date From: ${mainInfo.startDate} To: ${mainInfo.endDate} | Item: ${mainInfo.itemname} - ${mainInfo.stockValue}`,
  ]);
  worksheet.mergeCells("A3:C3");
  worksheet.getCell("A3").alignment = { horizontal: "center" };

  worksheet.addRow([]); // spacing

  // ===== Table Headers =====
  const headerRow = worksheet.addRow(["G/L Code", "G/L Head", "Amount Issued (Rs.)"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ===== Table Body =====
  let grandTotalAmount = 0;

  data.forEach((row) => {
    const amount = row.amountIssued || 0;
    grandTotalAmount += amount;

    const excelRow = worksheet.addRow([
      row.glCode || "",
      row.glName || "",
      amount,
    ]);

    excelRow.getCell(1).alignment = { horizontal: "center" };
    excelRow.getCell(2).alignment = { horizontal: "left" };
    excelRow.getCell(3).alignment = { horizontal: "right" };

    excelRow.getCell(3).numFmt = "#,##0.00";
  });

  // ===== Grand Total Row =====
  const totalRow = worksheet.addRow([
    "Grand Total",
    "",
    grandTotalAmount,
  ]);

  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(3).font = { bold: true };
  totalRow.getCell(3).numFmt = "#,##0.00";

  totalRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9EAD3" }, // light green
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ===== Column Widths =====
  worksheet.columns = [
    { key: "glCode", width: 15 },
    { key: "glName", width: 40 },
    { key: "amountIssued", width: 20 },
  ];

  // ===== Save File =====
  const buffer = await workbook.xlsx.writeBuffer();
  fs.saveAs(new Blob([buffer]), `${fileName}.xlsx`);
}


async exportAsStockExcelFileRR(data: any[], fileName: string, mainInfo: any): Promise<void> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Receipt Register");

  // ===== Header =====
  worksheet.addRow(["FabIndustries (Pvt) Ltd"]).font = { bold: true, size: 14 };
  worksheet.mergeCells("A1:R1");

  worksheet.addRow(["Receipt Register"]).font = { bold: true, size: 12 };
  worksheet.mergeCells("A2:R2");

  worksheet.addRow([`Date From: ${mainInfo.startDate} To: ${mainInfo.endDate} Item: ${mainInfo.itemname} - ${mainInfo.stockValue}`]);
  worksheet.mergeCells("A3:R3");

  worksheet.addRow([]); // spacing

  // ===== Table Header =====
  worksheet.addRow([
    "GRN No.", "GRN Date", "PR No", "PO No", "IGP No",
    "Vendor Code", "Vendor Name", "Item Code", "Item Name",
    "Unit", "Qty Rcvd", "Qty Rej", "Net Qty",
    "Unit Price", "Excl. Tax", "S.Tax", "Incl. Tax", "Remarks"
  ]);

  const headerRow = worksheet.getRow(5);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  // ===== Group Data =====
  const groupedData = data.reduce((acc: any, item: any) => {
    const key = item.grnNumber;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  Object.keys(groupedData).forEach(grnNumber => {
    const group = groupedData[grnNumber];

    group.forEach((row:any) => {
      const dataRow = worksheet.addRow([
        row.grnNumber || "",
        row.grnDate || "",
        row.prNumber || "",
        row.poNumber || "",
        row.igpNumber || "",
        row.vendorCode || "",
        row.vendorName || "",
        row.itemCode || "",
        row.itemName || "",
        row.unit || "",
        row.quantityReceived ?? 0,
        row.quantityRejected ?? 0,
        (row.quantityReceived ?? 0) - (row.quantityRejected ?? 0),
        row.rate ?? 0,
        row.excludeTaxAmout ?? 0,
        row.saleTax ?? 0,
        row.includeTaxAmount ?? 0,
        row.remarks || ""
      ]);

      dataRow.eachCell(cell => {
        cell.alignment = { horizontal: "center" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    });

    // ===== Subtotal Row =====
    if (group.length > 1) {
      const totalReceived = group.reduce((s:any, x:any) => s + (x.quantityReceived || 0), 0);
      const totalRejected = group.reduce((s:any, x:any) => s + (x.quantityRejected || 0), 0);
      const totalNet = totalReceived - totalRejected;
      const totalExclTax = group.reduce((s:any, x:any) => s + (x.saleTax || 0), 0);
      const totalStax = group.reduce((s:any, x:any) => s + (x.excludeTaxAmout || 0), 0);
      const totalInclTax = group.reduce((s:any, x:any) => s + (x.includeTaxAmount || 0), 0);
      const totalFreight = group.reduce((s:any, x:any) => s + (x.freightCharges || 0), 0);

      worksheet.addRow([
        "Subtotal:", "", "", "", "", "", "", "", "", "",
        totalReceived.toFixed(2),
        totalRejected.toFixed(2),
        totalNet.toFixed(2),
        "-", totalStax.toFixed(2),
        totalExclTax.toFixed(2),
        totalInclTax.toFixed(2),
        ""
      ]).font = { bold: true };

      worksheet.addRow([
        "", "", "", "", "", "", "", "", "", "Freight",
        "", "", "", "", "", "", totalFreight.toFixed(2), ""
      ]).font = { bold: true };
    }else{
       const lastRow = worksheet.lastRow;
        if (lastRow) {
      lastRow.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } }; // light gray background
        cell.font = { bold: true }; // make it bold
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "medium" }, right: { style: "thin" } }; // thicker bottom border
      });
      worksheet.addRow([]);
    }
    }
  });

  // ===== Grand Totals =====
  const grandReceived = data.reduce((s, x) => s + (x.quantityReceived || 0), 0);
  const grandRejected = data.reduce((s, x) => s + (x.quantityRejected || 0), 0);
  const grandNet = grandReceived - grandRejected;
  const grandExclTax = data.reduce((s, x) => s + (x.saleTax || 0), 0);
  const grandStax = data.reduce((s, x) => s + (x.excludeTaxAmout || 0), 0);
  const grandInclTax = data.reduce((s, x) => s + (x.includeTaxAmount || 0), 0);
  const grandFreight = data.reduce((s, x) => s + (x.freightCharges || 0), 0);

  worksheet.addRow([
    "Grand Total:", "", "", "", "", "", "", "", "", "",
    grandReceived.toFixed(2),
    grandRejected.toFixed(2),
    grandNet.toFixed(2),
    "-", grandStax.toFixed(2),
    grandExclTax.toFixed(2),
    grandInclTax.toFixed(2),
    ""
  ]).font = { bold: true };

  worksheet.addRow([
    "", "", "", "", "", "", "", "", "", "Freight",
    "", "", "", "", "", "", grandFreight.toFixed(2), ""
  ]).font = { bold: true };

  // ===== Auto Column Width =====
[6, 7, 8, 9].forEach((colIndex) => {
  const col = worksheet.getColumn(colIndex);
  let maxLength = 0;

  col.eachCell({ includeEmpty: false }, (cell: any) => {
    if (cell.value != null) {
      const len = cell.value.toString().length;
      if (len > maxLength) maxLength = len;
    }
  });

  // Apply width scaling
  if (maxLength < 8) {
    col.width = maxLength + 1;
  } else if (maxLength < 20) {
    col.width = Math.round(maxLength * 0.8);
  } else {
    col.width = 20; // cap
  }
});

  // ===== Save Excel =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  fs.saveAs(blob, `${fileName}.xlsx`);
}


async exportToExceltrial(data: any) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Trial Balance');

  // 1. Setup Main Headers (The complex merged rows)
  worksheet.addRow(['Accounting Head', 'Opening Balances', '', 'During the Period', '', 'Closing Balances', '']);
  worksheet.mergeCells('A1:A2'); // Accounting Head
  worksheet.mergeCells('B1:C1'); // Opening
  worksheet.mergeCells('D1:E1'); // During
  worksheet.mergeCells('F1:G1'); // Closing

  // 2. Setup Sub Headers
  worksheet.addRow(['', 'Debit', 'Credit', 'Debit', 'Credit', 'Debit', 'Credit']);

  // Styling Headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };
  worksheet.getRow(2).alignment = { horizontal: 'center' };

  const addNodeToExcel = (node: any, level: number = 0) => {
    const indent = ' '.repeat(level * 3); // Simple indentation for Excel

    // Check if it's a leaf node (Level 4)
    if (!node.children || node.children.length === 0) {
      const hasSubLedgers = node.subLedgers && node.subLedgers.length > 0;
      // Add Level 4 Row
     const l4Row = worksheet.addRow([
        indent + (node.level4Name || ''),
        node.openingDebit,
        node.openingCredit,
        node.periodDebit,
        node.periodCredit,
        node.closingDebit,
        node.closingCredit
      ]);
if (hasSubLedgers) {
    l4Row.eachCell((cell) => {
      // Font Style
      cell.font = { 
        bold: true, 
        color: { argb: 'FF006400' } // Dark Green text
      };
      // Background Fill
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E9' } // Very light green background
      };
      // Optional: Add a thin border to separate the group
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  }
      // Add Sub-ledgers if applicable
      
      if (node.subLedgers) {
        node.subLedgers.forEach((sub: any) => {
          worksheet.addRow([
            '   ' + indent + sub.subLedgerName,
            sub.openingDebit,
            sub.openingCredit,
            sub.periodDebit,
            sub.periodCredit,
            sub.closingDebit,
            sub.closingCredit
          ]);
        });
      }
      return;
    }

    // Level 2 / 3 Row
    const name = node.level2Name || node.level3Name || '';
    const row = worksheet.addRow([
      indent + name,
      node.openingDebit,
      node.openingCredit,
      node.periodDebit,
      node.periodCredit,
      node.closingDebit,
      node.closingCredit
    ]);

    // Apply some styling to group headers
    row.font = { bold: true, color: { argb: 'FF2323BA' } };

    // Recurse children
    node.children.forEach((child: any) => addNodeToExcel(child, level + 1));
  };

  // 3. Populate Data
  data.rows.forEach((r: any) => addNodeToExcel(r, 0));

  // 4. Grand Total Row
  const totalRow = worksheet.addRow([
    'GRAND TOTAL',
    data.totals.openingDebit,
    data.totals.openingCredit,
    data.totals.periodDebit,
    data.totals.periodCredit,
    data.totals.closingDebit,
    data.totals.closingCredit
  ]);
  totalRow.font = { bold: true };

  // 5. Formatting Columns (Widths and Numbers)
  worksheet.columns.forEach((col, i) => {
    col.width = i === 0 ? 40 : 15;
    if (i > 0) {
      col.numFmt = '#,##0.00';
    }
  });

  // 6. Generate and Save File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: EXCEL_TYPE });
  FileSaver.saveAs(blob, `Trial_Balance_${new Date().getTime()}.xlsx`);
}
  async exportAsStockExcelFile(data: any[], fileName: string, mainInfo: any): Promise<void> {

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // ----------- TITLE BLOCK -----------
  worksheet.addRow(['FabIndustries (Pvt) Ltd']).font = { bold: true, size: 14 };
  worksheet.mergeCells(`A1:N1`);

  worksheet.addRow(['Stock Report']).font = { bold: true, size: 12 };
  worksheet.mergeCells(`A2:N2`);

  worksheet.addRow([
    `Date From: ${mainInfo.startDate}  To: ${mainInfo.endDate}   Item: ${mainInfo.itemname}`
  ]);
  worksheet.mergeCells(`A3:N3`);

  worksheet.addRow([]);

  // ----------- HEADER GROUPS -----------
  worksheet.addRow([
    '', '',
    'Opening', '', '',
    'Received', '', '',
    'Issuance', '', '',
    'Balance', '', ''
  ]);

  const headerRow1 = worksheet.getRow(5);
  headerRow1.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  worksheet.mergeCells('C5:E5');
  worksheet.mergeCells('F5:H5');
  worksheet.mergeCells('I5:K5');
  worksheet.mergeCells('L5:N5');

  worksheet.addRow([
    'Item Code', 'Item Description',
    'Opening Qty', 'Opening Rate', 'Opening Amount',
    'Received Qty', 'Received Rate', 'Received Amount',
    'Issuance Qty', 'Issuance Rate', 'Issuance Amount',
    'Balance Qty', 'Balance Rate', 'Balance Amount'
  ]);

  const headerRow = worksheet.getRow(6);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  const roundTo2 = (val: any) =>
    Math.round((+val + Number.EPSILON) * 100) / 100;


  // ----------- PROCESS GROUPED DATA -----------
  data.forEach(group => {

    // 🔹 Main Group Row
    const mainRow = worksheet.addRow([`${group.mainCode} - ${group.mainCodeName}`]);
    mainRow.font = { bold: true, size: 12 };
    worksheet.mergeCells(`A${mainRow.number}:N${mainRow.number}`);

    // 🔹 Sub Group Row
    const subRow = worksheet.addRow([`${group.subCode} - ${group.subCodeName}`]);
    subRow.font = { bold: true, italic: true };
    worksheet.mergeCells(`A${subRow.number}:N${subRow.number}`);

    // 🔹 Third Level Group Row (Item Group)
    if (group.itemGroupCode) {
      const thirdRow = worksheet.addRow([`${group.itemGroupCode} - ${group.itemGroupName}`]);
      thirdRow.font = { bold: true, color: { argb: '4B4B4B' } };
      worksheet.mergeCells(`A${thirdRow.number}:N${thirdRow.number}`);
    }

    // 🔹 Item Rows
    (group.items || []).forEach((row: any) => {

      const excelRow = worksheet.addRow([
        row.itemCodeFull || '',
        row.codeDecription || '',
        roundTo2(row.openQuantity ?? 0),
        roundTo2(row.openRate ?? 0),
        roundTo2(row.openAmount ?? 0),
        roundTo2(row.grnQuantity ?? 0),
        roundTo2(row.grnRate ?? 0),
        roundTo2(row.grnAmount ?? 0),
        roundTo2(row.sinQuantity ?? 0),
        roundTo2(row.sinRate ?? 0),
        roundTo2(row.sinAmount ?? 0),
        roundTo2(row.balanceQty ?? 0),
        roundTo2(row.balanceRate ?? 0),
        roundTo2(row.balanceAmount ?? 0)
      ]);

      excelRow.eachCell(cell => {
        cell.alignment = { horizontal: 'right' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      excelRow.getCell(1).alignment = { horizontal: 'left' };
      excelRow.getCell(2).alignment = { horizontal: 'left' };
    });

    // ----------- Subtotal Row -----------
    const subtotalRow = worksheet.addRow([
      'Subtotal:', '', '',
      '', '', // Opening ignored
      roundTo2(group.items.reduce((s:any,r:any)=>s+(r.grnQuantity??0),0)),
      '', 
      roundTo2(group.items.reduce((s:any,r:any)=>s+(r.grnAmount??0),0)),
      roundTo2(group.items.reduce((s:any,r:any)=>s+(r.sinQuantity??0),0)),
      '',
      roundTo2(group.items.reduce((s:any,r:any)=>s+(r.sinAmount??0),0)),
      roundTo2(group.totalBalanceQty ?? 0),
      '',
      roundTo2(group.totalBalanceAmount ?? 0)
    ]);

    subtotalRow.font = { bold: true };

    subtotalRow.eachCell((cell, col) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: col === 1 ? 'left' : 'right' };
    });

  });


  // ----------- GRAND TOTAL -----------
  const grandGRNQty = data.reduce((s, g) => s + g.items.reduce((x:any, r:any) => x + (r.grnQuantity ?? 0), 0), 0);
  const grandGRNAmt = data.reduce((s, g) => s + g.items.reduce((x:any, r:any) => x + (r.grnAmount ?? 0), 0), 0);
  const grandSINQty = data.reduce((s, g) => s + g.items.reduce((x:any, r:any) => x + (r.sinQuantity ?? 0), 0), 0);
  const grandSINAmt = data.reduce((s, g) => s + g.items.reduce((x:any, r:any) => x + (r.sinAmount ?? 0), 0), 0);
  const grandBalQty = data.reduce((s, g) => s + (g.totalBalanceQty ?? 0), 0);
  const grandBalAmt = data.reduce((s, g) => s + (g.totalBalanceAmount ?? 0), 0);

  const grandRow = worksheet.addRow([
    'GRAND TOTAL', '', '', '', '',
    roundTo2(grandGRNQty), '', roundTo2(grandGRNAmt),
    roundTo2(grandSINQty), '', roundTo2(grandSINAmt),
    roundTo2(grandBalQty), '', roundTo2(grandBalAmt)
  ]);

  grandRow.font = { bold: true, size: 12 };

  grandRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'right' };
  });

  grandRow.getCell(1).alignment = { horizontal: 'left' };


  // ----------- Auto Column Width -----------
worksheet.columns.forEach((column, colIndex) => {
  if (!column) return;

  if (colIndex === 1) {
    column.width = 15;
  } 
  else if (colIndex === 2) {
    let maxLength = 30;

    column?.eachCell?.({ includeEmpty: true }, (cell, row) => {
      if (row <= 6) return;
      if (cell.value) {
        maxLength = Math.max(maxLength, cell.value.toString().length);
      }
    });

    column.width = Math.min(maxLength + 2, 60);
  } 
  else {
    column.width = 15;
  }
});


  // ----------- SAVE FILE -----------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  fs.saveAs(blob, `${fileName}.xlsx`);
}



async exportAsExcelForItemLeagerFile(data: any[], fileName: string, mainInfo: any): Promise<void> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Report');
worksheet.addRow(['FabIndustries (Pvt) Ltd' || '']).font = { bold: true, size: 14 };
  worksheet.mergeCells(`A1:N1`);

  worksheet.addRow(['Stock Report' || '']).font = { bold: true, size: 12 };
  worksheet.mergeCells(`A2:N2`);

  worksheet.addRow([`Date From: ${mainInfo.startDate}  To: ${mainInfo.endDate}   Item: ${mainInfo.itemname}`]);
  worksheet.mergeCells(`A3:N3`);

  // 🔹 First header row (group headers)
  worksheet.addRow([
    'Document', '', 'Narration',
    'Received', '', '',
    'Issuance', '', '',
    'Balance', '', ''
  ]);

   // merge correct row (Row 4)
  worksheet.mergeCells('A4:B4'); // Document
  worksheet.mergeCells('D4:F4'); // Received
  worksheet.mergeCells('G4:I4'); // Issuance
  worksheet.mergeCells('J4:L4'); // Balance

  const headerRow1 = worksheet.getRow(4);
  headerRow1.height = 25;
  headerRow1.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Second header row (sub headers) → Row 5
  worksheet.addRow([
    'No', 'Date', 'Narration',
    'Qty', 'Rate', 'Amount',
    'Qty', 'Rate', 'Amount',
    'Qty', 'Rate', 'Amount'
  ]);

  const headerRow2 = worksheet.getRow(5);
  headerRow2.height = 20;
  headerRow2.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B9BD5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Data rows
  data.forEach((row: any) => {
    const r = worksheet.addRow([
      row.documentType + ' ' + row.documentNumber || '',
      row.documentDate || '',
      row.name + '\n ' + (row.remarks ? `(${row.remarks})` : '')  || '',
      row.receivedQty || '0.00',
      row.receivedRate || '0.00',
      row.receivedAmount || '0.00',
      row.issuanceQty || '0.00',
      row.issuedRate || '0.00',
      row.issuanceAmount || '0.00',
      row.balanceQty || '0.00',
      row.balanceRate || '0.00',
      row.balanceAmount || '0.00'
    ]);

    r.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });

  // 🔹 Summary row
  const totalRow = worksheet.addRow([
    'Total', '', '',
    this.calculateTotal('receivedQty', data), '-', this.calculateTotal('receivedAmount', data),
    this.calculateTotal('issuanceQty', data), '-', this.calculateTotal('issuanceAmount', data),
    this.calculateTotal('balanceQty', data), '-', this.calculateTotal('balanceAmount', data)
  ]);

  worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`);

  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  totalRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } }; // Green background
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Adjust column widths
  worksheet.columns = [
    { width: 15 }, // No
    { width: 12 }, // Date
    { width: 30 }, // Narration
    { width: 10 }, { width: 10 }, { width: 15 }, // Received
    { width: 10 }, { width: 10 }, { width: 15 }, // Issuance
    { width: 10 }, { width: 10 }, { width: 15 }, // Balance
  ];

  // Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.xlsx`;
  link.click();
}

// Helper to calculate totals
private calculateTotal(field: string, data: any[]): number {
  return data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
}

async exportOnlyItemLedgerQuantityExcel(data: any[], fileName: string, mainInfo: any) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('OnlyQuantity Report');

  // 🔹 Report Headers
  worksheet.addRow(['FabIndustries (Pvt) Ltd']).font = { bold: true, size: 14 };
  worksheet.mergeCells(`A1:F1`);

  worksheet.addRow(['Stock Report - Only Quantity']).font = { bold: true, size: 12 };
  worksheet.mergeCells(`A2:F2`);

  worksheet.addRow([`Date From: ${mainInfo.startDate}  To: ${mainInfo.endDate}   Item: ${mainInfo.itemname}`]);
  worksheet.mergeCells(`A3:F3`);

  // 🔹 First header row (group headers)
  worksheet.addRow([
    'Document', '', 'Narration',
    'Received', 'Issuance', 'Balance'
  ]);

  // Merge "Document" across 2 columns
  worksheet.mergeCells('A4:B4');

  const headerRow1 = worksheet.getRow(4);
  headerRow1.height = 25;
  headerRow1.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Second header row (sub headers)
  worksheet.addRow([
    'No', 'Date', 'Narration',
    'Qty', 'Qty', 'Qty'
  ]);

  const headerRow2 = worksheet.getRow(5);
  headerRow2.height = 20;
  headerRow2.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B9BD5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Data rows
  data.forEach((row: any) => {
    const r = worksheet.addRow([
      row.documentType + ' ' + row.documentNumber || '',
      row.documentDate || '',
      row.name + '\n ' + (row.remarks ? `(${row.remarks})` : '')  || '',
      row.receivedQty || '0.00',
      row.issuanceQty || '0.00',
      row.balanceQty || '0.00'
    ]);

    r.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });

  // 🔹 Summary row
  const totalRow = worksheet.addRow([
    'Total', '', '',
    this.calculateTotalQ('receivedQty', data),
    this.calculateTotalQ('issuanceQty', data),
    '-'
  ]);

  worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`);

  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  totalRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } }; // Green background
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 🔹 Adjust column widths
  worksheet.columns = [
    { width: 15 }, // No
    { width: 12 }, // Date
    { width: 30 }, // Narration
    { width: 12 }, // Received Qty
    { width: 12 }, // Issuance Qty
    { width: 12 }  // Balance Qty
  ];

  // Save Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}-OnlyQuantity.xlsx`;
  link.click();
}

// Helper for totals
private calculateTotalQ(field: string, data: any[]): number {
  return data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
}

}
