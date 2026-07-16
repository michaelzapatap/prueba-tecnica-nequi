export const FEATURE_FLAGS = {
  taskSearchEnabled: 'task_search_enabled',
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export type FeatureFlagDefaults = Readonly<Record<FeatureFlag, boolean>>;

export abstract class FeatureFlagService {
  abstract isEnabled(featureFlag: FeatureFlag): Promise<boolean>;
}
