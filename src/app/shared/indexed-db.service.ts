// src/app/indexed-db.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, from, Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
// import { openDB, IDBPDatabase, IDBPObjectStore } from 'idb'; // Import IDB library
interface SaleData {
  SaleDate: Date;
  TotalAmount: number;
  ProductSales: any[]; // Structure of product sale data
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'posDb';
  private storeName = 'Sales';
  private serverUrl = 'https://your-api-endpoint.com/sync';

  constructor(private http: HttpClient) {}

  openDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.dbName, 1);

      request.onerror = (event: Event) => {
        reject('Error opening IndexedDB');
      };

      request.onsuccess = (event: Event) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event: Event) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      };
    });
  }

  addSale(saleData: SaleData): Promise<void> {
    return this.openDB().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        // Add the entire sale data (including product sales) to the Sales table
        const saleRequest = store.add(saleData);

        saleRequest.onsuccess = () => {
          resolve();
        };

        saleRequest.onerror = () => {
          reject('Error adding sale data to IndexedDB');
        };
      });
    });
  }

  syncDataPeriodically(): Observable<void> {
    const synchronizationInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    const stopSync$ = new Subject<void>();

    return interval(synchronizationInterval).pipe(
      takeUntil(stopSync$),
      switchMap(() => this.syncDataWithAPI()),
      takeUntil(stopSync$)
    );
  }

  // Synchronize data with API
  async syncDataWithAPI(): Promise<void> {
    const dataToUpload = await this.retrieveDataFromIndexedDB();

    if (dataToUpload.length > 0) {
      await this.uploadDataToAPI(dataToUpload);
    }
  }

    // Retrieve data from IndexedDB
    async retrieveDataFromIndexedDB(): Promise<SaleData[]> {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
  
      const salesData: SaleData[] = [];
  
      return new Promise<SaleData[]>((resolve, reject) => {
        const request = store.openCursor();
  
        request.onsuccess = (event) => {
          const cursor: IDBCursorWithValue | null = (event.target as IDBRequest)?.result;
  
          if (cursor) {
            salesData.push(cursor.value);
            cursor.continue();
          } else {
            resolve(salesData);
          }
        };
  
        request.onerror = () => {
          reject('Error retrieving data from IndexedDB');
        };
      });
    }
    
    
    
    
    
  
  // Upload data to API
  async uploadDataToAPI(dataToUpload: SaleData[]): Promise<void> {
    for (const dataItem of dataToUpload) {
      try {
        await this.http.post(this.serverUrl, dataItem).toPromise();
        // Handle successful upload (e.g., mark the data as uploaded)
      } catch (error) {
        // Handle API upload failure
        // You can retry the failed data here or implement a retry mechanism
      }
    }
  }

}
