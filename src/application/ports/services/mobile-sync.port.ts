export interface PullSyncInput {
  deviceId: string;
  lastPulledAt?: number;
}

export interface PushSyncInput {
  deviceId: string;
  changes: Record<string, unknown>;
}

export interface MobileSyncPort {
  pull(
    input: PullSyncInput,
  ): Promise<{ changes: Record<string, unknown>; timestamp: number }>;
  push(input: PushSyncInput): Promise<{ success: true; timestamp: number }>;
}
