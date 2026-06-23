// src/app/product.service.ts
import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: any[] = [];

  constructor(private indexedDbService: IndexedDbService) {}

  loadProductsFromIndexedDB() {
    //return this.indexedDbService.getProducts()
    
  }

  // addProduct(product: any): Promise<void> {
  //   //return this.indexedDbService.addProduct(product).then(() => {
  //     this.products.push(product);
  //   });
  }

  // getProducts(): any[] {
  //   return this.products;
  // }
//}
