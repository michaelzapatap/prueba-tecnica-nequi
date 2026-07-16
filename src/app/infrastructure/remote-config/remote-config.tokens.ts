import { InjectionToken } from '@angular/core';
import { FirebaseOptions } from 'firebase/app';
import { RemoteConfigSettings } from 'firebase/remote-config';

import { FeatureFlagDefaults } from '../../application/feature-flags/feature-flag.service';

export const FIREBASE_OPTIONS = new InjectionToken<FirebaseOptions>('FIREBASE_OPTIONS');
export const REMOTE_CONFIG_SETTINGS = new InjectionToken<RemoteConfigSettings>(
  'REMOTE_CONFIG_SETTINGS',
);
export const FEATURE_FLAG_DEFAULTS = new InjectionToken<FeatureFlagDefaults>(
  'FEATURE_FLAG_DEFAULTS',
);
