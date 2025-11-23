import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { VehiclesService } from '../../../services/vehicles.service';
import { JerrysService } from '../../../services/jerrys.service';

@Component({
  standalone: true,
  selector: 'app-jerry-usage',
  imports: [CommonModule, IonicModule],
  templateUrl: './jerry-usage.page.html',
  styleUrls: ['./jerry-usage.page.scss'],
})
export class JerryUsagePage {

  vehicleId   = '';
  vehicleName = '';
  siteId      = '';
  fuelType: 'diesel' | 'petrol' = 'diesel';
  fuelAfterPct = 0;

  jerryCount = 0;

  tankLiters  = 80;   // Hilux/Ranger
  jerryLiters = 20;   // cada jerry

  // Preview del nivel final de combustible
  finalPctPreview = 0;

  // Máximo de jerrys permitidos según lo que aún cabe en el tanque
  maxJerrys = 0;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private vehiclesService: VehiclesService,
    private jerrysService: JerrysService,
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.vehicleId    = params.get('vehicleId')   ?? '';
      this.vehicleName  = params.get('vehicleName') ?? '';
      this.siteId       = params.get('siteId')      ?? '';
      this.fuelAfterPct = +(params.get('fuelAfter') ?? 0);
      this.fuelType     = (params.get('fuelType') as any) ?? 'diesel';

      // 🔹 Litros actuales en el tanque
      const currentLiters = (this.fuelAfterPct / 100) * this.tankLiters;

      // 🔹 Litros libres que aún caben
      const freeLiters = Math.max(0, this.tankLiters - currentLiters);

      // 🔹 Máximo de jerrys que se pueden agregar sin pasar la capacidad
      this.maxJerrys = Math.floor(freeLiters / this.jerryLiters);

      // Preview inicial sin jerrys
      this.updatePreview();
    });
  }

  addJerry(delta: number) {
    const next = this.jerryCount + delta;

    if (next < 0) {
      // No negativos
      this.jerryCount = 0;
    } else if (next > this.maxJerrys) {
      // No pasar el máximo que cabe en el tanque
      this.jerryCount = this.maxJerrys;
      // Si quieres puedes avisar al usuario:
      // alert(`Max jerrys for this vehicle: ${this.maxJerrys}`);
    } else {
      this.jerryCount = next;
    }

    this.updatePreview();
  }

  // Calcula el % final que se muestra como “Final Fuel”
  updatePreview() {
    const currentLiters = (this.fuelAfterPct / 100) * this.tankLiters;
    const addedLiters   = this.jerryCount * this.jerryLiters;
    const finalLiters   = currentLiters + addedLiters;

    this.finalPctPreview = Math.min(
      100,
      Math.round((finalLiters / this.tankLiters) * 100)
    );
  }

  async saveReport() {
    if (!this.vehicleId) return;

    const currentLiters = (this.fuelAfterPct / 100) * this.tankLiters;
    const addedLiters   = this.jerryCount * this.jerryLiters;
    const finalLiters   = currentLiters + addedLiters;

    const finalPct = Math.min(
      100,
      Math.round((finalLiters / this.tankLiters) * 100)
    );

    try {
      // 1) actualizar % combustible del vehículo
      await this.vehiclesService.updateVehicle(this.vehicleId, {
        lastFuelPct: finalPct,
      });

      // 2) registrar uso de jerrys en el stock
      if (this.jerryCount > 0 && this.siteId) {
        await this.jerrysService.registerUsage(
          this.siteId,
          this.fuelType,
          this.jerryCount
        );
      }

      // 3) ir a la pantalla "Great Job" indicando que viene de jerrys
      this.navCtrl.navigateRoot(['/great-job'], {
        queryParams: { from: 'jerry' },
      });

    } catch (err) {
      console.error('Error en saveReport()', err);
    }
  }
}
