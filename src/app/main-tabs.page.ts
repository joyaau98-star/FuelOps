import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-main-tabs',
  imports: [IonicModule, RouterModule],
  template: `
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom" class="fo-tabbar">
        <ion-tab-button
          tab="vehicles"
          [routerLink]="['/tabs/vehicles']"
          class="fo-tabbtn"
        >
          <ion-icon name="car-outline"></ion-icon>
          <ion-label>Vehículos</ion-label>
        </ion-tab-button>

        <ion-tab-button
          tab="jerrys"
          [routerLink]="['/tabs/jerrys']"
          class="fo-tabbtn"
        >
          <ion-icon name="cube-outline"></ion-icon>
          <ion-label>Jerrys</ion-label>
        </ion-tab-button>

        <ion-tab-button
          tab="history"
          [routerLink]="['/tabs/history']"
          class="fo-tabbtn"
        >
          <ion-icon name="time-outline"></ion-icon>
          <ion-label>Historial</ion-label>
        </ion-tab-button>

        <ion-tab-button
          tab="profile"
          [routerLink]="['/tabs/profile']"
          class="fo-tabbtn"
        >
          <ion-icon name="person-circle-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .fo-tabbar {
      --background: #05070b;
      --border: 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 4px;
    }

    .fo-tabbtn {
      --color: rgba(255,255,255,0.55);
      --color-selected: #4d8dff;
      --ripple-color: rgba(77,141,255,0.3);
      font-size: 11px;
    }

    .fo-tabbtn ion-icon {
      font-size: 20px;
      margin-bottom: 2px;
    }

    .fo-tabbtn.ion-focused,
    .fo-tabbtn[aria-selected="true"] {
      font-weight: 500;
    }
  `],
})
export class MainTabsPage {}
