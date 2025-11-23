import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TestFirebaseService, Vehicle } from '../../../core/services/test-firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehicle-test',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Prueba Firestore</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p *ngIf="!(vehicles$ | async)?.length">Sin datos aún…</p>
      <ion-list>
        <ion-item *ngFor="let v of vehicles$ | async">{{ v.name }}</ion-item>
      </ion-list>
    </ion-content>
  `
})
export class VehicleTestPage implements OnInit {
  private test = inject(TestFirebaseService);
  vehicles$!: Observable<Vehicle[]>;
  ngOnInit() { this.vehicles$ = this.test.getVehicles(); }
}
