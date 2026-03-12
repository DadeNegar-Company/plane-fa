/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Types for time tracking / worklogs

export type TIssueWorklog = {
  id: string;
  issue: string;
  project: string;
  workspace: string;
  actor: string;
  actor_detail: {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    avatar_url: string;
  };
  duration_minutes: number;
  date_worked: string; // "YYYY-MM-DD"
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type TIssueWorklogMap = Record<string, TIssueWorklog>;

export type TIssueWorklogIdMap = Record<string, string[]>;
