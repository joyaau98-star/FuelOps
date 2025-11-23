import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

export interface Vehicle {
  id?: string;
  name: string;
  plate?: string;
  fuelType?: 'diesel' | 'petrol' | 'unleaded';
  siteId?: 'omeo' | 'DinnerPlain' | 'MtHotham' | string;
  active?: boolean;
  available?: boolean;

  // NUEVOS CAMPOS
  fuelTankLiters?: number;      // capacidad del tanque (ej. 80 L)
  jerryCapacityLiters?: number; // capacidad de cada jerry (ej. 20 L)

  lastOdometer?: number;
  lastFuelPct?: number;
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private fs = inject(Firestore);
  private st = inject(Storage);

  getAllVehicles$(): Observable<Vehicle[]> {
    const colRef = collection(this.fs, 'vehicles');
    return collectionData(colRef, { idField: 'id' }) as Observable<Vehicle[]>;
  }

  async createVehicle(v: Partial<Vehicle>) {
    const colRef = collection(this.fs, 'vehicles');
    return addDoc(colRef, {
      name: v.name ?? 'Vehicle',
      plate: v.plate ?? '',
      fuelType: v.fuelType ?? 'diesel',
      siteId: v.siteId ?? 'omeo',
      active: v.active ?? true,
      available: v.available ?? true,
      lastOdometer: v.lastOdometer ?? null,
      lastFuelPct: v.lastFuelPct ?? null,
      photoUrl: v.photoUrl ?? null,

      // si no mandas nada, asumimos tanque 80L y jerry 20L
      fuelTankLiters: v.fuelTankLiters ?? 80,
      jerryCapacityLiters: v.jerryCapacityLiters ?? 20,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const refDoc = doc(this.fs, 'vehicles', id);
    return updateDoc(refDoc, { ...data, updatedAt: serverTimestamp() });
  }

  async deleteVehicle(id: string) {
    const refDoc = doc(this.fs, 'vehicles', id);
    return deleteDoc(refDoc);
  }

  async uploadVehiclePhoto(vehicleId: string, file: File) {
    const key = `vehicles/${vehicleId}/${Date.now()}_${file.name}`;
    const sref = ref(this.st, key);
    await uploadBytes(sref, file);
    const url = await getDownloadURL(sref);
    await this.updateVehicle(vehicleId, { photoUrl: url });
    return url;
  }
}
