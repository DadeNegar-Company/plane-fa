/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TModuleOrderByOptions =
  | "name"
  | "-name"
  | "progress"
  | "-progress"
  | "issues_length"
  | "-issues_length"
  | "target_date"
  | "-target_date"
  | "created_at"
  | "-created_at"
  | "sort_order";

export type TModuleLayoutOptions = "list" | "board" | "gantt" | "kanban";

export type TModuleGroupByOptions = "status" | "lead" | "members" | "label" | "start_date" | "target_date" | null;

export type TModuleDisplayPropertyKey =
  | "lead"
  | "members"
  | "labels"
  | "start_date"
  | "target_date"
  | "progress"
  | "issue_count";

export type TModuleDisplayProperties = {
  [key in TModuleDisplayPropertyKey]?: boolean;
};

export type TModuleDisplayFilters = {
  favorites?: boolean;
  layout?: TModuleLayoutOptions;
  order_by?: TModuleOrderByOptions;
  group_by?: TModuleGroupByOptions;
  sub_group_by?: TModuleGroupByOptions;
  show_empty_groups?: boolean;
  display_properties?: TModuleDisplayProperties;
};

export type TModuleFilters = {
  label?: string[] | null;
  lead?: string[] | null;
  members?: string[] | null;
  start_date?: string[] | null;
  status?: string[] | null;
  target_date?: string[] | null;
};

export type TModuleFiltersByState = {
  default: TModuleFilters;
  archived: TModuleFilters;
};

export type TModuleStoredFilters = {
  display_filters?: TModuleDisplayFilters;
  filters?: TModuleFilters;
};
