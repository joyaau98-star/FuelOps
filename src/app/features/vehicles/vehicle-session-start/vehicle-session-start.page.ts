import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { VehiclesService, Vehicle } from '../../../services/vehicles.service';
import { VehicleSessionsService } from '../../../services/vehicle-sessions.service';

import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-vehicle-session-start',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './vehicle-session-start.page.html',
  styleUrls: ['./vehicle-session-start.page.scss'],
})
export class VehicleSessionStartPage {
  private fb         = inject(FormBuilder);
  private vehiclesSvc = inject(VehiclesService);
  private sessions    = inject(VehicleSessionsService);
  private auth        = inject(Auth);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private fs          = inject(Firestore);

  isAdmin = false;

  // 🔹 Datos que vienen desde "View details" (fleet overview)
  vehicleId   = this.route.snapshot.queryParamMap.get('vehicleId')   ?? '';
  vehicleName = this.route.snapshot.queryParamMap.get('vehicleName') ?? 'Vehículo';
  photoUrl    = this.route.snapshot.queryParamMap.get('photoUrl')    ?? '';
  plate       = this.route.snapshot.queryParamMap.get('plate')       ?? '';

  lastFuelPct  = Number(this.route.snapshot.queryParamMap.get('lastFuelPct')  ?? 0);
  lastOdometer = Number(this.route.snapshot.queryParamMap.get('lastOdometer') ?? 0);
  siteId       = this.route.snapshot.queryParamMap.get('siteId')     ?? 'DinnerPlain';
  fuelType     = (this.route.snapshot.queryParamMap.get('fuelType') as any) ?? 'petrol';

  // Vehículos + flag isBusy según si tienen sesión abierta
  vehiclesWithStatus$: Observable<(Vehicle & { isBusy: boolean })[]> =
    combineLatest([
      this.vehiclesSvc.getAllVehicles$(),
      this.sessions.getOpenSessions$(),
    ]).pipe(
      map(([vehicles, openSessions]) => {
        const busySet = new Set(openSessions.map(s => s.vehicleId));
        return vehicles.map(v => ({
          ...v,
          isBusy: v.id ? busySet.has(v.id) : false,
        }));
      })
    );

  selected?: Vehicle;

  form = this.fb.group({
    vehicleId:      [this.vehicleId || ''],
    startOdometer:  [this.lastOdometer || null],
    startFuelPct:   [this.lastFuelPct ?? 50],
    site: ['DinnerPlain' as 'Omeo' | 'DinnerPlain' | 'MtHotham', [Validators.required]],
  });

  constructor() {
    // Debug opcional
    this.vehiclesSvc.getAllVehicles$().subscribe(v => {
      console.log('🔥 Vehicles desde Firestore:', v);
    });

    // Si venimos desde "View details", rellenamos también el selected
    if (this.vehicleId) {
      this.selected = {
        id: this.vehicleId,
        name: this.vehicleName,
        photoUrl: this.photoUrl,
        plate: this.plate,
        lastFuelPct: this.lastFuelPct,
        lastOdometer: this.lastOdometer,
        siteId: this.siteId,
        fuelType: this.fuelType,
      } as Vehicle;
    }

    // Cargar rol del usuario para saber si es admin
    const user = this.auth.currentUser;
    if (user) {
      const ref = doc(this.fs, 'users', user.uid);
      getDoc(ref).then(snap => {
        const data = snap.data() as any;
        this.isAdmin = data?.role === 'admin';
      });
    }
  }

  // Si sigues usando lista dentro de esta página
  selectVehicle(v: Vehicle) {
    this.selected = v;
    this.form.patchValue({
      vehicleId: v.id!,
      startOdometer: v.lastOdometer ?? null,
      startFuelPct: v.lastFuelPct ?? 50,
      site: 'DinnerPlain',
    });
  }

  pctValid(n: any) {
    const x = Number(n);
    return !isNaN(x) && x >= 0 && x <= 100;
  }

  get isDinnerPlain(): boolean {
    return this.form.get('site')?.value === 'DinnerPlain';
  }

  async save() {
    const user = this.auth.currentUser;
    if (!user) return;

    const { vehicleId, startOdometer, startFuelPct, site } = this.form.getRawValue();
    if (!vehicleId || startOdometer == null || !this.pctValid(startFuelPct)) return;

    // 🔒 Seguridad extra: solo permitir Dinner Plain
    if (!this.isDinnerPlain) {
      console.warn('❌ Solo se puede iniciar en Dinner Plain');
      return;
    }

    await this.sessions.openSession({
      vehicleId,
      userId: user.uid,
      site: site!,
      startOdometer: Number(startOdometer),
      startFuelPct: Number(startFuelPct),
    });

    this.router.navigate(
      ['/vehicles', vehicleId, 'session-open'],
      {
        queryParams: {
          photoUrl: this.selected?.photoUrl ?? this.photoUrl ?? '',
          vehicleName: this.selected?.name ?? this.vehicleName ?? 'Vehículo',
        },
      }
    );

    this.selected = undefined;
    this.form.reset({ vehicleId: '', startFuelPct: 50, site: 'DinnerPlain' });
  }

  async onPhotoSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!this.selected || !input.files || !input.files[0]) return;

    const file = input.files[0];
    try {
      const url = await this.vehiclesSvc.uploadVehiclePhoto(this.selected.id!, file);
      this.selected.photoUrl = url;
    } catch (e) {
      console.error('Error subiendo foto', e);
    } finally {
      input.value = '';
    }
  }
}
