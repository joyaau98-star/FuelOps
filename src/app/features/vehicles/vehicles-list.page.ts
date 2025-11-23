import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { VehiclesService, Vehicle } from '../../services/vehicles.service';

@Component({
  standalone: true,
  selector: 'app-vehicles-list',
  imports: [CommonModule, IonicModule],
  templateUrl: './vehicles-list.page.html',
  styleUrls: ['./vehicles-list.page.scss'],
})
export class VehiclesListPage {
  private vehiclesSvc = inject(VehiclesService);
  private router = inject(Router);

  vehicles$: Observable<Vehicle[]> = this.vehiclesSvc.getAllVehicles$();

  userName = 'Juan';

  onSelectVehicle(vehicle: Vehicle) {
    console.log('CLICK VEHICLE', vehicle); // 👈 esto DEBE verse en consola

    this.router.navigate(['/tabs/start'], {
      queryParams: {
        vehicleId:    vehicle.id,
        vehicleName:  vehicle.name,
        photoUrl:     vehicle.photoUrl ?? '',
        plate:        vehicle.plate ?? '',
        lastFuelPct:  vehicle.lastFuelPct ?? 50,
        lastOdometer: vehicle.lastOdometer ?? 0,
        siteId:       vehicle.siteId ?? 'DinnerPlain',
        fuelType:     vehicle.fuelType ?? 'petrol',
      },
    });
  }
}
