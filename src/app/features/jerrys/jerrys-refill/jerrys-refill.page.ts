import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { JerrysService, JerryStock } from '../../../services/jerrys.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-jerrys-refill',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './jerrys-refill.page.html',
})
export class JerrysRefillPage {   // 👈 MUY IMPORTANTE ESTE NOMBRE!!


  siteId: string = 'DinnerPlain';
  stock$?: Observable<JerryStock | undefined>;

  petrolRefilled = 0;
  dieselRefilled = 0;

  constructor(
    private jerrysService: JerrysService,
    private navCtrl: NavController,
  ) {
    this.loadStock();
  }

  loadStock() {
    this.stock$ = this.jerrysService.getStockForSite(this.siteId);
  }

  onSiteChange() {
    this.loadStock();
  }

  async saveRefill() {
    try {
      await this.jerrysService.registerRefill(
        this.siteId,
        this.petrolRefilled,
        this.dieselRefilled
      );

      this.petrolRefilled = 0;
      this.dieselRefilled = 0;

      this.navCtrl.navigateRoot('/start'); // o '/admin'
    } catch (err) {
      console.error('Error guardando refill jerrys', err);
    }
  }
}
