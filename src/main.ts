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
import { provideApplicationServices } from './app/application/application.providers';
import { provideLocalPersistence } from './app/infrastructure/persistence/local-persistence.providers';
import { provideRemoteFeatureFlags } from './app/infrastructure/remote-config/remote-config.providers';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideLocalPersistence(),
    provideRemoteFeatureFlags(),
    provideApplicationServices(),
  ],
});
