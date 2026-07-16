export const environment = {
  production: true,
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  remoteConfig: {
    fetchTimeoutMillis: 3_000,
    minimumFetchIntervalMillis: 43_200_000,
  },
  featureFlags: {
    task_search_enabled: true,
  },
};
