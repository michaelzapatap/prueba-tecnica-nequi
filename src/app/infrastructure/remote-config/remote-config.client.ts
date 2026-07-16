import { Injectable } from '@angular/core';
import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import {
  fetchAndActivate,
  getBoolean,
  getRemoteConfig,
  isSupported,
  RemoteConfig,
  RemoteConfigSettings,
} from 'firebase/remote-config';

import { FeatureFlagDefaults } from '../../application/feature-flags/feature-flag.service';

export abstract class RemoteConfigClient {
  abstract initialize(
    firebaseOptions: FirebaseOptions,
    settings: RemoteConfigSettings,
    defaults: FeatureFlagDefaults,
  ): Promise<boolean>;

  abstract refresh(): Promise<void>;

  abstract getBoolean(key: string): boolean;
}

@Injectable()
export class FirebaseRemoteConfigClient implements RemoteConfigClient {
  private static readonly appName = 'nequi-tasks-remote-config';
  private remoteConfig: RemoteConfig | null = null;

  async initialize(
    firebaseOptions: FirebaseOptions,
    settings: RemoteConfigSettings,
    defaults: FeatureFlagDefaults,
  ): Promise<boolean> {
    if (this.remoteConfig) {
      return true;
    }

    if (!(await isSupported())) {
      return false;
    }

    const firebaseApp = this.getOrCreateApp(firebaseOptions);
    const remoteConfig = getRemoteConfig(firebaseApp);
    remoteConfig.settings = settings;
    remoteConfig.defaultConfig = defaults;
    this.remoteConfig = remoteConfig;

    return true;
  }

  async refresh(): Promise<void> {
    await fetchAndActivate(this.requireRemoteConfig());
  }

  getBoolean(key: string): boolean {
    return getBoolean(this.requireRemoteConfig(), key);
  }

  private getOrCreateApp(firebaseOptions: FirebaseOptions): FirebaseApp {
    return (
      getApps().find((firebaseApp) => firebaseApp.name === FirebaseRemoteConfigClient.appName) ??
      initializeApp(firebaseOptions, FirebaseRemoteConfigClient.appName)
    );
  }

  private requireRemoteConfig(): RemoteConfig {
    if (!this.remoteConfig) {
      throw new Error('Remote Config has not been initialized.');
    }

    return this.remoteConfig;
  }
}
