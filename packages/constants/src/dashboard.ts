/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// types
import type { TIssuesListTypes } from "@plane/types";

export enum EDurationFilters {
  NONE = "none",
  TODAY = "today",
  THIS_WEEK = "this_week",
  THIS_MONTH = "this_month",
  THIS_YEAR = "this_year",
  CUSTOM = "custom",
}

// filter duration options
export const DURATION_FILTER_OPTIONS: {
  key: EDurationFilters;
  label: string;
  i18n_label: string;
}[] = [
  {
    key: EDurationFilters.NONE,
    label: "All time",
    i18n_label: "dashboard.duration.all_time",
  },
  {
    key: EDurationFilters.TODAY,
    label: "Due today",
    i18n_label: "dashboard.duration.due_today",
  },
  {
    key: EDurationFilters.THIS_WEEK,
    label: "Due this week",
    i18n_label: "dashboard.duration.due_this_week",
  },
  {
    key: EDurationFilters.THIS_MONTH,
    label: "Due this month",
    i18n_label: "dashboard.duration.due_this_month",
  },
  {
    key: EDurationFilters.THIS_YEAR,
    label: "Due this year",
    i18n_label: "dashboard.duration.due_this_year",
  },
  {
    key: EDurationFilters.CUSTOM,
    label: "Custom",
    i18n_label: "dashboard.duration.custom",
  },
];

// random background colors for project cards
export const PROJECT_BACKGROUND_COLORS = [
  "bg-gray-500/20",
  "bg-success-subtle",
  "bg-danger-subtle",
  "bg-orange-500/20",
  "bg-blue-500/20",
  "bg-yellow-500/20",
  "bg-pink-500/20",
  "bg-purple-500/20",
];

// assigned and created issues widgets tabs list
export const FILTERED_ISSUES_TABS_LIST: {
  key: TIssuesListTypes;
  label: string;
  i18n_label: string;
}[] = [
  {
    key: "upcoming",
    label: "Upcoming",
    i18n_label: "dashboard.assigned.upcoming",
  },
  {
    key: "overdue",
    label: "Overdue",
    i18n_label: "dashboard.assigned.overdue",
  },
  {
    key: "completed",
    label: "Marked completed",
    i18n_label: "dashboard.assigned.marked_completed",
  },
];

// assigned and created issues widgets tabs list
export const UNFILTERED_ISSUES_TABS_LIST: {
  key: TIssuesListTypes;
  label: string;
  i18n_label: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    i18n_label: "dashboard.created.pending",
  },
  {
    key: "completed",
    label: "Marked completed",
    i18n_label: "dashboard.created.marked_completed",
  },
];

export type TLinkOptions = {
  userId: string | undefined;
};
