import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { VehicleSession } from '../models/vehicle-session.model';

@Injectable({ providedIn: 'root' })
export class VehicleSessionsService {
  private db = inject(Firestore);
  private colRef = collection(this.db, 'vehicleSessions');

  createStart(data: Omit<VehicleSession, 'id' | 'createdAt' | 'updatedAt' | 'lowFuelAlert'>): Promise<any> {
    const lowFuelAlert = data.startFuelPct < 30; // umbral configurable
    const payload: VehicleSession = {
      ...data,
      lowFuelAlert,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return addDoc(this.colRef, payload);
  }

  completeEnd(id: string, end: { endOdometer: number; endFuelPct: number; usedJerry?: boolean }) {
    const ref = doc(this.db, 'vehicleSessions', id);
    return updateDoc(ref, { ...end, updatedAt: Date.now() });
  }

  listByDate(dateYMD: string): Observable<VehicleSession[]> {
    // versión simple: trae todo y filtra en cliente (luego lo optimizamos con queries)
    return collectionData(this.colRef, { idField: 'id' }) as Observable<VehicleSession[]>;
  }
}
