/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Timer / Stopwatch store — persisted in localStorage

import { action, computed, makeObservable, observable, runInAction } from "mobx";

const TIMER_STORAGE_KEY = "plane_active_timer";

export type TActiveTimer = {
  issueId: string;
  projectId: string;
  workspaceSlug: string;
  startedAt: number; // epoch ms
};

export interface ITimerStore {
  activeTimer: TActiveTimer | null;
  // computed
  isTimerRunning: boolean;
  getElapsedSeconds: () => number;
  // actions
  startTimer: (workspaceSlug: string, projectId: string, issueId: string) => void;
  stopTimer: () => TActiveTimer | null;
  cancelTimer: () => void;
}

export class TimerStore implements ITimerStore {
  activeTimer: TActiveTimer | null = null;

  constructor() {
    makeObservable(this, {
      activeTimer: observable.ref,
      isTimerRunning: computed,
      startTimer: action,
      stopTimer: action,
      cancelTimer: action,
    });
    // restore from localStorage
    this.restoreTimer();
  }

  get isTimerRunning(): boolean {
    return this.activeTimer !== null;
  }

  getElapsedSeconds = (): number => {
    if (!this.activeTimer) return 0;
    return Math.floor((Date.now() - this.activeTimer.startedAt) / 1000);
  };

  startTimer = (workspaceSlug: string, projectId: string, issueId: string) => {
    const timer: TActiveTimer = {
      issueId,
      projectId,
      workspaceSlug,
      startedAt: Date.now(),
    };
    this.activeTimer = timer;
    this.persistTimer();
  };

  stopTimer = (): TActiveTimer | null => {
    const timer = this.activeTimer;
    this.activeTimer = null;
    this.clearPersistedTimer();
    return timer;
  };

  cancelTimer = () => {
    this.activeTimer = null;
    this.clearPersistedTimer();
  };

  private restoreTimer() {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TActiveTimer;
        if (parsed.issueId && parsed.projectId && parsed.workspaceSlug && parsed.startedAt) {
          runInAction(() => {
            this.activeTimer = parsed;
          });
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  private persistTimer() {
    if (this.activeTimer) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(this.activeTimer));
    }
  }

  private clearPersistedTimer() {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  }
}
