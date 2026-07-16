import { TestBed } from '@angular/core/testing';
import { FirebaseOptions } from 'firebase/app';
import { RemoteConfigSettings } from 'firebase/remote-config';

import {
  FEATURE_FLAGS,
  FeatureFlagDefaults,
} from '../../application/feature-flags/feature-flag.service';
import { FirebaseFeatureFlagService } from './firebase-feature-flag.service';
import { RemoteConfigClient } from './remote-config.client';
import {
  FEATURE_FLAG_DEFAULTS,
  FIREBASE_OPTIONS,
  REMOTE_CONFIG_SETTINGS,
} from './remote-config.tokens';

class FakeRemoteConfigClient implements RemoteConfigClient {
  initializeCalls = 0;
  refreshCalls = 0;
  isSupported = true;
  value = false;
  refreshError: Error | null = null;

  async initialize(): Promise<boolean> {
    this.initializeCalls += 1;
    return this.isSupported;
  }

  async refresh(): Promise<void> {
    this.refreshCalls += 1;

    if (this.refreshError) {
      throw this.refreshError;
    }
  }

  getBoolean(): boolean {
    return this.value;
  }
}

const configuredFirebaseOptions: FirebaseOptions = {
  apiKey: 'test-api-key',
  appId: 'test-app-id',
  projectId: 'test-project-id',
};

const settings: RemoteConfigSettings = {
  fetchTimeoutMillis: 3_000,
  minimumFetchIntervalMillis: 60_000,
};

const defaults: FeatureFlagDefaults = {
  task_search_enabled: false,
};

function createService(
  client: RemoteConfigClient,
  firebaseOptions: FirebaseOptions,
  featureFlagDefaults: FeatureFlagDefaults,
): FirebaseFeatureFlagService {
  TestBed.configureTestingModule({
    providers: [
      FirebaseFeatureFlagService,
      { provide: RemoteConfigClient, useValue: client },
      { provide: FIREBASE_OPTIONS, useValue: firebaseOptions },
      { provide: REMOTE_CONFIG_SETTINGS, useValue: settings },
      { provide: FEATURE_FLAG_DEFAULTS, useValue: featureFlagDefaults },
    ],
  });

  return TestBed.inject(FirebaseFeatureFlagService);
}

describe('FirebaseFeatureFlagService', () => {
  it('uses the local default without initializing Firebase when configuration is missing', async () => {
    const client = new FakeRemoteConfigClient();
    const service = createService(client, {}, { task_search_enabled: true });

    expect(await service.isEnabled(FEATURE_FLAGS.taskSearchEnabled)).toBeTrue();
    expect(client.initializeCalls).toBe(0);
  });

  it('returns the activated Remote Config value after a successful refresh', async () => {
    const client = new FakeRemoteConfigClient();
    client.value = true;
    const service = createService(client, configuredFirebaseOptions, defaults);

    expect(await service.isEnabled(FEATURE_FLAGS.taskSearchEnabled)).toBeTrue();
    expect(client.refreshCalls).toBe(1);
  });

  it('uses the cached or in-app value when the refresh fails offline', async () => {
    const client = new FakeRemoteConfigClient();
    client.value = true;
    client.refreshError = new Error('Network unavailable.');
    const service = createService(client, configuredFirebaseOptions, defaults);

    expect(await service.isEnabled(FEATURE_FLAGS.taskSearchEnabled)).toBeTrue();
    expect(client.refreshCalls).toBe(1);
  });

  it('falls back when Remote Config is unsupported', async () => {
    const client = new FakeRemoteConfigClient();
    client.isSupported = false;
    const service = createService(client, configuredFirebaseOptions, {
      task_search_enabled: true,
    });

    expect(await service.isEnabled(FEATURE_FLAGS.taskSearchEnabled)).toBeTrue();
    expect(client.refreshCalls).toBe(0);
  });
});
