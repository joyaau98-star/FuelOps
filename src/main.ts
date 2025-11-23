import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, initializeFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from './environments/environment';

// 🔹 Ionicons
import { addIcons } from 'ionicons';
import { carOutline, cubeOutline, timeOutline } from 'ionicons/icons';

// ✅ Registrar iconos que usas en toda la app
addIcons({
  'car-outline': carOutline,
  'cube-outline': cubeOutline,
  'time-outline': timeOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Firebase App principal
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Auth
    provideAuth(() => getAuth()),

    // Firestore: usa la base 'fuelops-db'
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {}, 'fuelops-db');
    }),

    // Storage
    provideStorage(() => getStorage()),
  ],
});
