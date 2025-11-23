import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleService, Vehicle } from '../../data/vehicle.service';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-start-shift',
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  template: `
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Inicio de jornada</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <ion-item>
        <ion-label position="stacked">Vehículo</ion-label>
        <ion-select formControlName="vehicleId" placeholder="Selecciona" interface="popover">
          <ion-select-option *ngFor="let v of vehicles" [value]="v.id">
            {{ v.name }} ({{ v.plate }})
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Conductor</ion-label>
        <ion-input formControlName="driverName" placeholder="Nombre y apellido"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Odómetro inicial (km)</ion-label>
        <ion-input type="number" formControlName="odoStart" inputmode="numeric"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">% Combustible inicial</ion-label>
        <ion-range formControlName="fuelStart" [min]="0" [max]="100" [step]="1">
          <ion-label slot="start">0%</ion-label>
          <ion-label slot="end">100%</ion-label>
        </ion-range>
      </ion-item>

      <ion-button expand="block" type="submit" [disabled]="form.invalid || saving">
        {{ saving ? 'Guardando...' : 'GUARDAR INICIO' }}
      </ion-button>
    </form>
  </ion-content>
  `
})
export default class StartShiftComponent {
  private fb = inject(FormBuilder);
  private vehicleSvc = inject(VehicleService);
  private fs = inject(Firestore);
  private auth = inject(Auth);

  vehicles: Vehicle[] = [];
  saving = false;

  form = this.fb.group({
    vehicleId: ['', Validators.required],
    driverName: ['', [Validators.required, Validators.minLength(2)]],
    odoStart: [null as number | null, [Validators.required, Validators.min(0)]],
    fuelStart: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  constructor() {
    // Cargar vehículos del usuario
    this.vehicleSvc.myVehicles$().subscribe(vs => this.vehicles = vs);
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;
    try {
      const uid = this.auth.currentUser?.uid!;
      const data = {
        ...this.form.value,
        driverUid: uid,
        createdAt: serverTimestamp(),
        status: 'open'
      };
      await addDoc(collection(this.fs, 'shift-starts'), data);
      this.form.reset({ vehicleId: '', driverName: '', odoStart: null, fuelStart: 50 });
    } finally {
      this.saving = false;
    }
  }
}
