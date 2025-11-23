import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { VehiclesService, Vehicle } from '../../services/vehicles.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


type FuelType = 'diesel' | 'petrol' | 'unleaded';
type SiteId   = 'omeo' | 'DinnerPlain' | 'MtHotham';

@Component({
  standalone: true,
  selector: 'app-vehicles-admin',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Admin · Vehículos</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <div class="actions">
      <ion-button (click)="newVehicle()">Nuevo vehículo</ion-button>
    </div>

    <!-- Lista -->
        <div class="list">
      <div class="item" *ngFor="let v of (vehicles$ | async)!">
        <img *ngIf="v.photoUrl; else ic" [src]="v.photoUrl" class="thumb" alt="veh" />
        <ng-template #ic><div class="thumb icon">🚐</div></ng-template>

        <div class="info">
          <div class="name">{{ v.name }}</div>

          <div class="meta">
            <!-- Barra de combustible + número -->
            <div class="fuel-row">
              <ion-progress-bar [value]="(v.lastFuelPct ?? 0) / 100"></ion-progress-bar>
              <span class="fuel-label">{{ v.lastFuelPct ?? 0 }}%</span>
            </div>

            <!-- Último odómetro -->
            <div class="mileage" *ngIf="v.lastOdometer != null">
              Last mileage: {{ v.lastOdometer }} km
            </div>
          </div>
        </div>

        <div class="row-btns" (click)="$event.stopPropagation()">
          <ion-button fill="outline" size="small" (click)="viewDetails(v)">View details</ion-button>
          <ion-button fill="outline" size="small" color="medium" (click)="editVehicle(v)">Editar</ion-button>
          <ion-button color="danger" fill="outline" size="small" (click)="remove(v)">Borrar</ion-button>
        </div>
      </div>
    </div>


    <!-- Panel edición/creación -->
    <div class="panel" *ngIf="isOpen()">
      <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} vehículo</h3>

      <form [formGroup]="form">
        <div class="row">
          <ion-input label="Nombre" label-placement="stacked" formControlName="name"></ion-input>
          <ion-input label="Placa" label-placement="stacked" formControlName="plate"></ion-input>
        </div>

        <div class="row">
          <ion-select label="Combustible" label-placement="stacked" formControlName="fuelType">
            <ion-select-option value="diesel">Diesel</ion-select-option>
            <ion-select-option value="petrol">Petrol</ion-select-option>
            <ion-select-option value="unleaded">Unleaded</ion-select-option>
          </ion-select>
          <ion-select label="Sitio" label-placement="stacked" formControlName="siteId">
            <ion-select-option value="omeo">Omeo</ion-select-option>
            <ion-select-option value="DinnerPlain">Dinner Plain</ion-select-option>
            <ion-select-option value="MtHotham">Mt Hotham</ion-select-option>
          </ion-select>
        </div>

        <div class="row">
          <ion-input type="number" label="Odómetro" label-placement="stacked" formControlName="lastOdometer"></ion-input>
          <ion-input type="number" label="% Combustible" label-placement="stacked" formControlName="lastFuelPct"></ion-input>
        </div>

        <ion-toggle formControlName="active">Activo</ion-toggle>

        <div class="photo">
          <img *ngIf="photoPreview()" [src]="photoPreview()!" class="preview" alt="preview">
          <ion-button size="small">
            <label style="cursor:pointer">
              Subir foto
              <input type="file" accept="image/*" (change)="onPhoto($event)" style="display:none">
            </label>
          </ion-button>
        </div>

        <div class="panel-actions">
          <ion-button color="medium" fill="outline" (click)="close()">Cancelar</ion-button>
          <ion-button (click)="save()">Guardar</ion-button>
        </div>
      </form>
    </div>

  </ion-content>
  `,
  styles: [`
    ion-content { --background:#0f0f0f; color:#fff; }
    .actions{ display:flex; justify-content:flex-end; margin-bottom:10px; }
    .list{ display:flex; flex-direction:column; gap:10px; }
    .item{
      background:#1b1b1d; border-radius:16px; padding:12px; display:grid;
      grid-template-columns:56px 1fr auto; gap:12px; align-items:center;
      box-shadow:0 2px 10px rgba(0,0,0,.25);
    }
    .thumb{ width:56px;height:56px;border-radius:12px;object-fit:cover }
    .thumb.icon{ display:flex;align-items:center;justify-content:center;font-size:28px;background:#2b2b2e;color:#ddd }
    .info .name{ font-weight:700;margin-bottom:4px }
    .meta{ display:flex; gap:10px; flex-wrap:wrap; color:#c9c9c9; font-size:13px }
    .meta .bad{ color:#f88 }
    .row-btns{ display:flex; gap:8px }
    .panel{
      margin-top:14px;background:#1b1b1d;border-radius:16px;padding:16px;
      box-shadow:0 2px 10px rgba(0,0,0,.25)
    }
    .panel h3{ margin:0 0 10px }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:10px }
    .photo{ display:flex; align-items:center; gap:12px; margin:10px 0 }
    .preview{ width:72px;height:72px;border-radius:12px;object-fit:cover; box-shadow:0 1px 6px rgba(0,0,0,.25) }
    .panel-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:10px }
    @media (max-width:560px){ .row{ grid-template-columns:1fr } }

        .fuel-row {
      display:flex;
      align-items:center;
      gap:8px;
      width:100%;
    }
    .fuel-row ion-progress-bar {
      flex:1;
    }
    .fuel-label {
      min-width:40px;
      text-align:right;
      font-weight:600;
    }
    .mileage {
      font-size:12px;
      color:#c9c9c9;
      margin-top:4px;
    }


  `]
})
export class VehiclesAdminComponent {
  private fb = inject(NonNullableFormBuilder);
  private vehicles = inject(VehiclesService);
  private router = inject(Router);


  vehicles$: Observable<Vehicle[]> = this.vehicles.getAllVehicles$();

  // estado panel
  editingId = signal<string | null>(null);
  isOpen   = signal(false);
  photoPreview = signal<string | null>(null);

  // Con NonNullableFormBuilder NO se usa { nonNullable: true }.
  form = this.fb.group({
    name: this.fb.control<string>('', { validators: [Validators.required] }),
    plate: this.fb.control<string>(''),

    fuelType: this.fb.control<FuelType>('diesel'),
    siteId:   this.fb.control<SiteId>('omeo'),

    lastOdometer: this.fb.control<number | null>(null),
    lastFuelPct:  this.fb.control<number | null>(null),

    active: this.fb.control<boolean>(true),
  });

  newVehicle() {
    this.editingId.set(null);
    this.form.reset({
      name: '', plate: '', fuelType:'diesel', siteId:'omeo',
      lastOdometer: null, lastFuelPct: null, active: true,
    });
    this.photoPreview.set(null);
    this.isOpen.set(true);
  }

  editVehicle(v: Vehicle) {
    this.editingId.set(v.id!);
    this.form.patchValue({
      name: v.name ?? '',
      plate: v.plate ?? '',
      fuelType: (v.fuelType ?? 'diesel') as FuelType,
      siteId:   (v.siteId   ?? 'omeo')   as SiteId,
      lastOdometer: v.lastOdometer ?? null,
      lastFuelPct:  v.lastFuelPct  ?? null,
      active: v.active !== false,
    });
    this.photoPreview.set(v.photoUrl ?? null);
    this.isOpen.set(true);
  }

  close(){ this.isOpen.set(false); }

  async save() {
    const raw = this.form.getRawValue(); // tipos literales y no-null (salvo los numéricos)

    // valida con raw (string seguro)
    if (!raw.name.trim()) return;

    const val: Partial<Vehicle> = {
      name: raw.name,
      plate: raw.plate,
      fuelType: raw.fuelType,  // 'diesel'|'petrol'|'unleaded'
      siteId: raw.siteId,      // 'omeo'|'DinnerPlain'|'MtHotham'
      lastOdometer: raw.lastOdometer ?? undefined,
      lastFuelPct:  raw.lastFuelPct  ?? undefined,
      active: raw.active,
    };

    if (this.editingId()) {
      await this.vehicles.updateVehicle(this.editingId()!, val);
    } else {
      await this.vehicles.createVehicle(val);
    }
    this.isOpen.set(false);
  }

  async remove(v: Vehicle) {
    if (!v.id) return;
    const ok = confirm(`Eliminar “${v.name}”?`);
    if (!ok) return;
    await this.vehicles.deleteVehicle(v.id);
  }

  async onPhoto(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    // si no existe, primero crea el vehículo con valores actuales del form
    if (!this.editingId()) {
      const raw = this.form.getRawValue();
      // asegura nombre por si está vacío
      if (!raw.name.trim()) {
        this.form.patchValue({ name: 'Vehicle' });
      }
      const base: Partial<Vehicle> = {
        name: this.form.getRawValue().name, // ya con fallback
        plate: raw.plate,
        fuelType: raw.fuelType,
        siteId: raw.siteId,
        lastOdometer: raw.lastOdometer ?? undefined,
        lastFuelPct:  raw.lastFuelPct  ?? undefined,
        active: raw.active,
      };
      const ref = await this.vehicles.createVehicle(base);
      this.editingId.set(ref.id);
    }

    const id = this.editingId()!;
    const url = await this.vehicles.uploadVehiclePhoto(id, input.files[0]);
    this.photoPreview.set(url);
    input.value = '';
  }

    viewDetails(v: Vehicle) {
    this.router.navigate(['/start'], {
      queryParams: {
        vehicleId: v.id,
        vehicleName: v.name,
        photoUrl: v.photoUrl ?? '',
        siteId: v.siteId ?? '',
        fuelType: v.fuelType ?? 'petrol',

        lastFuelPct: v.lastFuelPct ?? 0,
        lastOdometer: v.lastOdometer ?? 0,
        plate: v.plate ?? '',
      }
    });
  }
}



