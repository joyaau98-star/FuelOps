import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Firestore,
  collection,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  writeBatch,
  updateDoc,
  collectionData,
} from '@angular/fire/firestore';

// Opcional pero muy útil para tipos
export interface VehicleSession {
  id?: string;
  vehicleId: string;
  userId: string;
  site: 'Omeo' | 'DinnerPlain' | 'MtHotham';
  startOdometer: number;
  startFuelPct: number;
  endOdometer?: number | null;
  endFuelPct?: number | null;
  startAt?: any;
  endAt?: any;
  status: 'open' | 'closed';
}

@Injectable({ providedIn: 'root' })
export class VehicleSessionsService {
  private fs = inject(Firestore);

  private colRef() {
    return collection(this.fs, 'vehicleSessions');
  }

  /**
   * Observable con TODAS las sesiones abiertas.
   * Lo usaremos para marcar los vehículos "en uso".
   */
  getOpenSessions$(): Observable<VehicleSession[]> {
    const qRef = query(this.colRef(), where('status', '==', 'open'));
    return collectionData(qRef, { idField: 'id' }) as Observable<VehicleSession[]>;
  }

  /**
   * Abre una nueva sesión de vehículo (inicio de jornada).
   * Evita que el mismo usuario tenga otra sesión "open" para el mismo vehículo.
   */
  async openSession(input: {
    vehicleId: string;
    userId: string;
    site: 'Omeo' | 'DinnerPlain' | 'MtHotham';
    startOdometer: number;
    startFuelPct: number;
  }) {
    // 1) Evitar duplicados abiertos
    const qRef = query(
      this.colRef(),
      where('userId', '==', input.userId),
      where('vehicleId', '==', input.vehicleId),
      where('status', '==', 'open'),
    );
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      throw new Error('Ya tienes una sesión abierta con este vehículo.');
    }

    // 2) Crear nueva sesión
    return await addDoc(this.colRef(), {
      ...input,
      startAt: serverTimestamp(),
      endAt: null,
      endOdometer: null,
      endFuelPct: null,
      status: 'open',
    });
  }

  /**
   * Cierra la última sesión "open" de ese usuario + vehículo,
   * actualiza odómetro final y % combustible final,
   * y también actualiza el documento del vehículo.
   */
  async closeLastOpenSession(input: {
    vehicleId: string;
    userId: string;
    endOdometer: number;
    endFuelPct: number;
  }) {
    // 1) Buscar sesión abierta
    const qRef = query(
      this.colRef(),
      where('userId', '==', input.userId),
      where('vehicleId', '==', input.vehicleId),
      where('status', '==', 'open'),
    );
    const snap = await getDocs(qRef);
    if (snap.empty) {
      throw new Error('No hay sesión abierta para cerrar.');
    }

    const sessionDoc = snap.docs[0];
    const docRef = doc(this.fs, 'vehicleSessions', sessionDoc.id);
    const batch = writeBatch(this.fs);

    const data = sessionDoc.data() as any;
    const startOdometer = Number(data.startOdometer ?? 0);
    const endOdometer = Number(input.endOdometer);
    const endFuelPct = Number(input.endFuelPct);

    // 2) Validaciones básicas
    if (isNaN(endOdometer) || endOdometer < startOdometer) {
      throw new Error('El odómetro final debe ser mayor o igual al inicial.');
    }

    if (isNaN(endFuelPct) || endFuelPct < 0 || endFuelPct > 100) {
      throw new Error('El % de combustible final debe estar entre 0 y 100.');
    }

    // 3) Actualizar la sesión
    batch.update(docRef, {
      endOdometer,
      endFuelPct,
      endAt: serverTimestamp(),
      status: 'closed',
    });

    // 4) Actualizar el vehículo
    const vehicleRef = doc(this.fs, 'vehicles', input.vehicleId);
    batch.update(vehicleRef, {
      lastOdometer: endOdometer,
      lastFuelPct: endFuelPct,
      lastUpdateAt: serverTimestamp(),
    });

    // 5) Confirmar cambios
    await batch.commit();
    return { id: sessionDoc.id };
  }

  /**
   * Obtiene la última sesión "open" para un vehículo y usuario.
   * Sirve para recuperar startOdometer y startFuelPct al final de la jornada.
   */
  async getLastOpenSession(vehicleId: string, userId: string) {
    const qRef = query(
      this.colRef(),
      where('vehicleId', '==', vehicleId),
      where('userId', '==', userId),
      where('status', '==', 'open'),
    );

    const snap = await getDocs(qRef);
    if (snap.empty) {
      return null;
    }

    const d = snap.docs[0];
    return {
      id: d.id,
      ...(d.data() as any),
    };
  }

  /**
   * Actualiza el consumo promedio de combustible del vehículo
   * usando una jornada completa (start/end km + start/end fuel).
   */
  async updateVehicleConsumption(session: {
    vehicleId: string;
    startOdometer: number;
    endOdometer: number;
    startFuelPct: number;
    endFuelPct: number;
  }) {
    const distanceKm = session.endOdometer - session.startOdometer;
    if (distanceKm <= 0) return;

    const deltaPct = session.startFuelPct - session.endFuelPct;
    // si el fuel no bajó (o subió porque cargaron combustible), no aprendemos
    if (deltaPct <= 0) return;

    const vehicleRef = doc(this.fs, 'vehicles', session.vehicleId);
    const snap = await getDoc(vehicleRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const tankLiters = data.tankLiters ?? 80;

    // litros usados en esta jornada
    const litersUsed = (deltaPct / 100) * tankLiters;

    // consumo puntual de esta jornada (L/100km)
    const currentSample = (litersUsed / distanceKm) * 100;

    const prevCons = data.consumptionLper100km ?? currentSample;
    const prevSamples = data.consumptionSamples ?? 0;

    const newSamples = prevSamples + 1;
    const newCons =
      (prevCons * prevSamples + currentSample) / newSamples;

    await updateDoc(vehicleRef, {
      consumptionLper100km: newCons,
      consumptionSamples: newSamples,
    });
  }
}
