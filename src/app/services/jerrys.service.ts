import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  updateDoc,
  serverTimestamp,
  increment,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface JerryStock {
  siteId: string;
  dieselFull: number;
  dieselEmpty: number;
  petrolFull: number;
  petrolEmpty: number;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class JerrysService {
  private fs = inject(Firestore);

  getStockForSite(siteId: string): Observable<JerryStock | undefined> {
    const refDoc = doc(this.fs, 'jerryStocks', siteId);
    return docData(refDoc, { idField: 'siteId' }) as Observable<JerryStock | undefined>;
  }

  async registerUsage(siteId: string, fuelType: 'diesel'|'petrol', count: number) {
    if (!count) return;
    const refDoc = doc(this.fs, 'jerryStocks', siteId);
    const data: any = { updatedAt: serverTimestamp() };

    if (fuelType === 'petrol') {
      data.petrolFull  = increment(-count);
      data.petrolEmpty = increment(count);
    } else {
      data.dieselFull  = increment(-count);
      data.dieselEmpty = increment(count);
    }

    return updateDoc(refDoc, data);
  }

  async registerRefill(siteId: string, petrolCount: number, dieselCount: number) {
    const refDoc = doc(this.fs, 'jerryStocks', siteId);
    const data: any = { updatedAt: serverTimestamp() };

    if (petrolCount) {
      data.petrolFull  = increment(petrolCount);
      data.petrolEmpty = increment(-petrolCount);
    }
    if (dieselCount) {
      data.dieselFull  = increment(dieselCount);
      data.dieselEmpty = increment(-dieselCount);
    }

    return updateDoc(refDoc, data);
  }
}
