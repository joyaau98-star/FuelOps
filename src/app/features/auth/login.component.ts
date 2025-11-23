

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="8" size-lg="5">
            <ion-card class="form-card">
              <ion-card-header>
                <ion-card-title class="form-title">Ingresa a FuelOps</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <ion-item>
                    <ion-label position="stacked">Correo</ion-label>
                    <ion-input type="email" formControlName="email"></ion-input>
                  </ion-item>

                                      <ion-item>
                      <ion-label position="stacked">Contraseña</ion-label>
                      <ion-input type="password" formControlName="password"></ion-input>
                    </ion-item>


                  <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
                    {{ loading ? 'Ingresando…' : 'Entrar' }}
                  </ion-button>
                </form>

                <div class="mt-2">
                  <ion-button fill="clear" size="small" (click)="onForgotPassword()">
                    ¿Olvidaste tu contraseña?
                  </ion-button>
                </div>

                <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    .form-card { padding: 1rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-title { font-size: clamp(18px, 2.5vw, 24px); }
    ion-input { font-size: 16px; }
    .mt-2{ margin-top:.5rem; }
  `]
})
export default class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);
  private alertCtrl = inject(AlertController);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    try {
      const { email, password } = this.form.value;
      await this.auth.login(email!, password!);
this.router.navigate(['/tabs/vehicles'], { replaceUrl: true });

    } catch (e: any) {
      this.error = e?.message ?? 'No se pudo iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  async onForgotPassword() {
    let email = this.form.value.email || '';
    if (!email) {
      const alert = await this.alertCtrl.create({
        header: 'Restablecer contraseña',
        message: 'Ingresa tu correo para enviarte un enlace.',
        inputs: [{ name: 'email', type: 'email', placeholder: 'tucorreo@dominio.com' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Enviar', role: 'confirm' }
        ],
      });
      await alert.present();
      const { role, data } = await alert.onDidDismiss();
      if (role !== 'confirm') return;
      email = data?.values?.email ?? '';
    }

    if (!email) {
      const t = await this.toast.create({
        message: 'Escribe un correo válido.',
        duration: 1800,
        color: 'warning',
      });
      return t.present();
    }

    try {
      await this.auth.resetPassword(email);
      const t = await this.toast.create({
        message: 'Te enviamos un correo para restablecer la contraseña.',
        duration: 2200,
        color: 'success',
      });
      t.present();
    } catch (e: any) {
      const t = await this.toast.create({
        message: e?.message || 'No se pudo enviar el correo.',
        duration: 2200,
        color: 'danger',
      });
      t.present();
    }
  }
}
