import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  active: boolean;
  assignedTo: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  myVehicles$(): Observable<Vehicle[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const col = collection(this.fs, 'vehicles');
        const q = query(col,
          where('assignedTo', '==', user.uid),
          where('active', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<Vehicle[]>;
      }),
      map(vs => vs.sort((a,b) => a.name.localeCompare(b.name)))
    );
  }
}
