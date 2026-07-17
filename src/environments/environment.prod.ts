import { firebaseOptions } from './firebase-options';

export const environment = {
  production: true,
  firebase: firebaseOptions,
  remoteConfig: {
    fetchTimeoutMillis: 3_000,
    minimumFetchIntervalMillis: 43_200_000,
  },
  featureFlags: {
    task_search_enabled: true,
  },
};
