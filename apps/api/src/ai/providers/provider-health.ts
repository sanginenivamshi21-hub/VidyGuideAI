import { Injectable, Logger } from '@nestjs/common';

export interface ProviderHealthEntry {
  name: string;
  successCount: number;
  failureCount: number;
  lastSuccess: number | null;
  lastFailure: number | null;
  averageLatencyMs: number;
  totalLatencyMs: number;
  callCount: number;
  cooldownUntil: number | null;
  cooldownReason: string | null;
  consecutiveFailures: number;
  disabled: boolean;
  disabledReason: string | null;
}

export const COOLDOWN_DURATIONS: Record<string, number> = {
  RATE_LIMITED: 15 * 60 * 1000,
  SERVER_ERROR: 2 * 60 * 1000,
  TIMEOUT: 2 * 60 * 1000,
  NETWORK: 1 * 60 * 1000,
  CONFIG_ERROR: 0,
  MODEL_NOT_FOUND: 0,
  INVALID_KEY: 0,
};

@Injectable()
export class ProviderHealth {
  private readonly logger = new Logger(ProviderHealth.name);
  private state: Map<string, ProviderHealthEntry> = new Map();

  register(name: string): void {
    if (!this.state.has(name)) {
      this.state.set(name, {
        name,
        successCount: 0,
        failureCount: 0,
        lastSuccess: null,
        lastFailure: null,
        averageLatencyMs: 0,
        totalLatencyMs: 0,
        callCount: 0,
        cooldownUntil: null,
        cooldownReason: null,
        consecutiveFailures: 0,
        disabled: false,
        disabledReason: null,
      });
    }
  }

  recordSuccess(name: string, latencyMs: number): void {
    const entry = this.getEntry(name);
    entry.successCount++;
    entry.lastSuccess = Date.now();
    entry.totalLatencyMs += latencyMs;
    entry.callCount++;
    entry.averageLatencyMs = Math.round(entry.totalLatencyMs / entry.callCount);
    entry.consecutiveFailures = 0;
    entry.cooldownUntil = null;
    entry.cooldownReason = null;
  }

  recordFailure(name: string, errorCode: string, errorMessage: string, latencyMs?: number): void {
    const entry = this.getEntry(name);
    entry.failureCount++;
    entry.lastFailure = Date.now();
    entry.consecutiveFailures++;

    if (latencyMs !== undefined) {
      entry.totalLatencyMs += latencyMs;
      entry.callCount++;
      entry.averageLatencyMs = Math.round(entry.totalLatencyMs / entry.callCount);
    }

    if (errorCode === 'RATE_LIMITED') {
      this.enterCooldown(name, 'RATE_LIMITED');
    } else if (errorCode === 'SERVER_ERROR') {
      this.enterCooldown(name, 'SERVER_ERROR');
    } else if (errorCode === 'TIMEOUT') {
      this.enterCooldown(name, 'TIMEOUT');
    } else if (errorCode === 'NETWORK') {
      this.enterCooldown(name, 'NETWORK');
    } else if (errorCode === 'INVALID_KEY') {
      this.disable(name, `Invalid API key: ${errorMessage}`);
    } else if (errorCode === 'MODEL_NOT_FOUND') {
      this.disable(name, `Model not found: ${errorMessage}`);
    } else if (errorCode === 'CONFIG_ERROR') {
      this.disable(name, `Configuration error: ${errorMessage}`);
    }
  }

  private enterCooldown(name: string, reason: string): void {
    const duration = COOLDOWN_DURATIONS[reason] || 60_000;
    const entry = this.getEntry(name);
    entry.cooldownUntil = Date.now() + duration;
    entry.cooldownReason = reason;
    this.logger.warn(`[${name}] cooldown ${reason} for ${Math.round(duration / 1000)}s until ${new Date(entry.cooldownUntil).toISOString()}`);
  }

  private disable(name: string, reason: string): void {
    const entry = this.getEntry(name);
    entry.disabled = true;
    entry.disabledReason = reason;
    this.logger.warn(`[${name}] DISABLED: ${reason}`);
  }

  isHealthy(name: string): boolean {
    const entry = this.state.get(name);
    if (!entry) return false;
    if (entry.disabled) return false;
    if (entry.cooldownUntil && Date.now() < entry.cooldownUntil) return false;
    if (entry.cooldownUntil && Date.now() >= entry.cooldownUntil) {
      entry.cooldownUntil = null;
      entry.cooldownReason = null;
      this.logger.log(`[${name}] cooldown expired, available again`);
    }
    return true;
  }

  getCooldownRemaining(name: string): number | null {
    const entry = this.state.get(name);
    if (!entry?.cooldownUntil) return null;
    const remaining = entry.cooldownUntil - Date.now();
    return remaining > 0 ? remaining : null;
  }

  getCooldownReason(name: string): string | null {
    return this.state.get(name)?.cooldownReason || null;
  }

  getStatus(name: string): string {
    const entry = this.state.get(name);
    if (!entry) return 'unregistered';
    if (entry.disabled) return `disabled: ${entry.disabledReason}`;
    if (entry.cooldownUntil && Date.now() < entry.cooldownUntil) {
      const remaining = Math.round((entry.cooldownUntil - Date.now()) / 1000);
      return `cooldown ${remaining}s (${entry.cooldownReason})`;
    }
    return `healthy (${entry.successCount} ok, ${entry.failureCount} fail, ${entry.averageLatencyMs}ms avg)`;
  }

  getSummary(): { name: string; status: string; successCount: number; failureCount: number; avgLatencyMs: number; healthy: boolean }[] {
    const summaries: any[] = [];
    for (const [name, entry] of this.state) {
      summaries.push({
        name,
        status: this.getStatus(name),
        successCount: entry.successCount,
        failureCount: entry.failureCount,
        avgLatencyMs: entry.averageLatencyMs,
        healthy: this.isHealthy(name),
      });
    }
    return summaries;
  }

  private getEntry(name: string): ProviderHealthEntry {
    let entry = this.state.get(name);
    if (!entry) {
      this.register(name);
      entry = this.state.get(name)!;
    }
    return entry;
  }
}
