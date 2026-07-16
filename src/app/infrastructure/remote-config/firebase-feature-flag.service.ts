import { inject, Injectable } from '@angular/core';
import {
  FeatureFlag,
  FeatureFlagService,
} from '../../application/feature-flags/feature-flag.service';
import { RemoteConfigClient } from './remote-config.client';
import {
  FEATURE_FLAG_DEFAULTS,
  FIREBASE_OPTIONS,
  REMOTE_CONFIG_SETTINGS,
} from './remote-config.tokens';

@Injectable()
export class FirebaseFeatureFlagService implements FeatureFlagService {
  private readonly remoteConfigClient = inject(RemoteConfigClient);
  private readonly firebaseOptions = inject(FIREBASE_OPTIONS);
  private readonly settings = inject(REMOTE_CONFIG_SETTINGS);
  private readonly defaults = inject(FEATURE_FLAG_DEFAULTS);
  private initialization: Promise<boolean> | null = null;

  async isEnabled(featureFlag: FeatureFlag): Promise<boolean> {
    const fallback = this.defaults[featureFlag];

    if (!this.hasRequiredFirebaseOptions()) {
      return fallback;
    }

    try {
      const isInitialized = await this.initialize();

      if (!isInitialized) {
        return fallback;
      }

      try {
        await this.remoteConfigClient.refresh();
      } catch {
        // A cached activated value or the in-app default remains available offline.
      }

      return this.remoteConfigClient.getBoolean(featureFlag);
    } catch {
      return fallback;
    }
  }

  private initialize(): Promise<boolean> {
    this.initialization ??= this.remoteConfigClient.initialize(
      this.firebaseOptions,
      this.settings,
      this.defaults,
    );

    return this.initialization;
  }

  private hasRequiredFirebaseOptions(): boolean {
    return Boolean(
      this.firebaseOptions.apiKey && this.firebaseOptions.appId && this.firebaseOptions.projectId,
    );
  }
}
