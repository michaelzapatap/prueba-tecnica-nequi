import { Provider } from '@angular/core';

import { FeatureFlagService } from '../../application/feature-flags/feature-flag.service';
import { environment } from '../../../environments/environment';
import { FirebaseFeatureFlagService } from './firebase-feature-flag.service';
import { FirebaseRemoteConfigClient, RemoteConfigClient } from './remote-config.client';
import {
  FEATURE_FLAG_DEFAULTS,
  FIREBASE_OPTIONS,
  REMOTE_CONFIG_SETTINGS,
} from './remote-config.tokens';

export function provideRemoteFeatureFlags(): Provider[] {
  return [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    { provide: REMOTE_CONFIG_SETTINGS, useValue: environment.remoteConfig },
    { provide: FEATURE_FLAG_DEFAULTS, useValue: environment.featureFlags },
    { provide: RemoteConfigClient, useClass: FirebaseRemoteConfigClient },
    { provide: FeatureFlagService, useClass: FirebaseFeatureFlagService },
  ];
}
