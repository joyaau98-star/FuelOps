import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-session-open',
  imports: [CommonModule, IonicModule],
  templateUrl: './session-open.page.html',
  styleUrls: ['./session-open.page.scss'],
})
export class SessionOpenPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicleId = this.route.snapshot.paramMap.get('vehicleId') ?? '';
  vehicleName = this.route.snapshot.queryParamMap.get('vehicleName');
  photoUrl = this.route.snapshot.queryParamMap.get('photoUrl');
  fallbackImage = 'assets/img/vehicle-placeholder.png';

  goToEndSession() {
    this.router.navigate(
      ['/end'],
      {
        queryParams: {
          vehicleId: this.vehicleId,
          vehicleName: this.vehicleName,
          photoUrl: this.photoUrl,
        },
      }
    );
  }
}


