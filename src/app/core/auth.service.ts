import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,   // 👈 IMPORTANTE
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // 🔹 Login normal + logs de token
  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

    console.log('✅ LOGIN OK');
    console.log('UID:', cred.user.uid);
    console.log('Email:', cred.user.email);

    // ID token sin forzar
    const token = await cred.user.getIdToken();
    console.log('ID TOKEN (sin forceRefresh):', token.substring(0, 25) + '...');

    // ID token forzando renovación
    try {
      const freshToken = await cred.user.getIdToken(true);
      console.log(
        'ID TOKEN REFRESCADO (forceRefresh=true):',
        freshToken.substring(0, 25) + '...',
      );
    } catch (err) {
      console.error('❌ Error renovando ID token:', err);
    }

    return cred;
  }

  // 🔹 Resetear contraseña (para el botón "¿Olvidaste tu contraseña?")
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('📧 Email de reseteo enviado a:', email);
    } catch (err) {
      console.error('❌ Error enviando email de reseteo:', err);
      throw err;
    }
  }

  // 🔹 Método solo para debug desde cualquier componente
  async debugCurrentAuthState() {
    const user = this.auth.currentUser;
    console.log('🔍 auth.currentUser ahora mismo:', user);

    if (!user) {
      console.warn('⚠ No hay usuario logueado (currentUser = null)');
      return;
    }

    try {
      const token = await user.getIdToken();
      console.log('🔍 ID TOKEN actual:', token.substring(0, 25) + '...');

      const freshToken = await user.getIdToken(true);
      console.log('🔍 ID TOKEN refrescado:', freshToken.substring(0, 25) + '...');
    } catch (err) {
      console.error(
        '❌ Error obteniendo/refrescando ID token desde debugCurrentAuthState:',
        err,
      );
    }
  }

  // 🔹 Log automático cuando cambia el estado de auth
  initAuthLogging() {
    onAuthStateChanged(this.auth, async (user) => {
      console.log('👀 onAuthStateChanged =>', user);
      if (user) {
        try {
          const token = await user.getIdToken();
          console.log(
            'onAuthStateChanged · ID TOKEN:',
            token.substring(0, 25) + '...',
          );
        } catch (err) {
          console.error(
            '❌ Error en onAuthStateChanged al pedir token:',
            err,
          );
        }
      }
    });
  }
}
