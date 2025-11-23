import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Vehicle {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TestFirebaseService {
  private db = inject(Firestore);

  // Lee todos los documentos de la colección "vehicles"
  getVehicles(): Observable<Vehicle[]> {
    const colRef = collection(this.db, 'vehicles');
    return collectionData(colRef, { idField: 'id' }) as Observable<Vehicle[]>;
  }
}
