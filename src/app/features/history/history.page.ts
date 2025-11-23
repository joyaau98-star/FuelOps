import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-history',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Historial</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/start" fill="clear">Inicio</ion-button>
          <ion-button routerLink="/end" fill="clear">Fin</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-text color="medium">Próximamente…</ion-text>
    </ion-content>
  `,
})
export default class HistoryPage {}   // 👈 ESTA es la línea que mencionas
