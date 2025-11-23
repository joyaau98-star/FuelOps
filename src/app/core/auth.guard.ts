import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { from, map } from 'rxjs';

// 🔐 Nuevo guard apropiado para Auth.currentUser
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Convertimos el currentUser (Promise) a Observable
  return from(auth.authStateReady()).pipe(
    map(() => {
      const user = auth.currentUser;

      if (!user) {
        console.warn('⛔ No logueado → redirect to /login');
        router.navigateByUrl('/login');
        return false;
      }

      console.log('🔓 Usuario autenticado:', user.uid);
      return true;
    })
  );
};
