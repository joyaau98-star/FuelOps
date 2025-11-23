import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-great-job',
  imports: [CommonModule, IonicModule],
  templateUrl: './great-job.page.html',
  styleUrls: ['./great-job.page.scss'],
})
export class GreatJobPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  fromJerry = false;

  ngOnInit() {
    const source = this.route.snapshot.queryParamMap.get('from');
    this.fromJerry = source === 'jerry';

    // Redirección automática después de 3s
    setTimeout(() => {
      // 👇 CORRECCIÓN: volver al tab de vehículos
      this.router.navigate(['/tabs/vehicles']);
    }, 3000);
  }
}
