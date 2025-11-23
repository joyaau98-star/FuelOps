import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';
import { VehicleSessionsService } from '../../../services/vehicle-sessions.service';

@Component({
  standalone: true,
  selector: 'app-vehicle-session-end',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './vehicle-session-end.page.html',
  styleUrls: ['./vehicle-session-end.page.scss'],
})
export class VehicleSessionEndPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private sessions = inject(VehicleSessionsService);

  vehicleId = this.route.snapshot.queryParamMap.get('vehicleId') ?? '';
  vehicleName = this.route.snapshot.queryParamMap.get('vehicleName') ?? 'Vehículo';
  photoUrl = this.route.snapshot.queryParamMap.get('photoUrl');
  fallbackImage = 'assets/img/vehicle-placeholder.png';

  // 🔹 Datos de inicio de jornada (cargados desde la sesión abierta)
  startOdometer = 0;
  startFuelPct = 0;

  form = this.fb.group({
    endOdometer: [null as number | null, [Validators.required, Validators.min(0)]],
    endFuelPct: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  get endOdometerCtrl() { return this.form.get('endOdometer'); }
  get endFuelPctCtrl() { return this.form.get('endFuelPct'); }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user || !this.vehicleId) return;

    try {
      // 🔹 Leer la sesión abierta para recuperar startOdometer y startFuelPct
      const openSession = await this.sessions.getLastOpenSession(this.vehicleId, user.uid);
      if (openSession) {
        this.startOdometer = Number(openSession.startOdometer ?? 0);
        this.startFuelPct  = Number(openSession.startFuelPct ?? 0);
      }
    } catch (err) {
      console.error('No se pudo cargar la sesión abierta del vehículo.', err);
    }
  }

  async saveEnd() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión.');
      return;
    }

    if (this.form.invalid || !this.vehicleId) {
      this.form.markAllAsTouched();
      return;
    }

    const { endOdometer, endFuelPct } = this.form.getRawValue();
    const fuelNumber = Number(endFuelPct);

    try {
      // 1️⃣ Cerrar la sesión: guarda km final + % combustible final + status 'closed'
      await this.sessions.closeLastOpenSession({
        vehicleId: this.vehicleId,
        userId: user.uid,
        endOdometer: Number(endOdometer),
        endFuelPct: fuelNumber,
      });

      // 2️⃣ Actualizar consumo promedio (modo aprendizaje)
      await this.sessions.updateVehicleConsumption({
        vehicleId: this.vehicleId,
        startOdometer: this.startOdometer,
        endOdometer: Number(endOdometer),
        startFuelPct: this.startFuelPct,
        endFuelPct: fuelNumber,
      });

      // 3️⃣ Decidir siguiente pantalla según % final
      if (fuelNumber <= 25) {
        // Combustible bajo → ir a jerrys
        this.router.navigate(
          ['/jerry-usage'],
          {
            queryParams: {
              vehicleId: this.vehicleId,
              vehicleName: this.vehicleName,
              fuelAfter: fuelNumber,
              siteId: this.route.snapshot.queryParamMap.get('siteId'),
              fuelType: this.route.snapshot.queryParamMap.get('fuelType'),
            },
          }
        );
      } else {
        // Combustible suficiente → ir directo a Great Job (sin jerrys)
        this.router.navigate(['/great-job'], {
          queryParams: { from: 'no-jerry' },
        });
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'No se pudo cerrar la sesión del vehículo.');
    }
  }
}
