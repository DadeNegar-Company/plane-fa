/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// types
import type {
  TModuleDisplayProperties,
  TModuleDisplayPropertyKey,
  TModuleGroupByOptions,
  TModuleLayoutOptions,
  TModuleOrderByOptions,
  TModuleStatus,
} from "@plane/types";

export const MODULE_STATUS_COLORS: {
  [key in TModuleStatus]: string;
} = {
  backlog: "#a3a3a2",
  planned: "#3f76ff",
  paused: "#525252",
  completed: "#16a34a",
  cancelled: "#ef4444",
  "in-progress": "#f39e1f",
};

export const MODULE_STATUS: {
  i18n_label: string;
  value: TModuleStatus;
  color: string;
  textColor: string;
  bgColor: string;
}[] = [
  {
    i18n_label: "project_modules.status.backlog",
    value: "backlog",
    color: MODULE_STATUS_COLORS.backlog,
    textColor: "text-placeholder",
    bgColor: "bg-layer-1",
  },
  {
    i18n_label: "project_modules.status.planned",
    value: "planned",
    color: MODULE_STATUS_COLORS.planned,
    textColor: "text-blue-500",
    bgColor: "bg-indigo-50",
  },
  {
    i18n_label: "project_modules.status.in_progress",
    value: "in-progress",
    color: MODULE_STATUS_COLORS["in-progress"],
    textColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    i18n_label: "project_modules.status.paused",
    value: "paused",
    color: MODULE_STATUS_COLORS.paused,
    textColor: "text-tertiary",
    bgColor: "bg-surface-2",
  },
  {
    i18n_label: "project_modules.status.completed",
    value: "completed",
    color: MODULE_STATUS_COLORS.completed,
    textColor: "text-success-primary",
    bgColor: "bg-success-subtle",
  },
  {
    i18n_label: "project_modules.status.cancelled",
    value: "cancelled",
    color: MODULE_STATUS_COLORS.cancelled,
    textColor: "text-danger-primary",
    bgColor: "bg-danger-subtle",
  },
];

export const MODULE_VIEW_LAYOUTS: {
  key: TModuleLayoutOptions;
  i18n_title: string;
}[] = [
  {
    key: "list",
    i18n_title: "project_modules.layout.list",
  },
  {
    key: "board",
    i18n_title: "project_modules.layout.board",
  },
  {
    key: "gantt",
    i18n_title: "project_modules.layout.timeline",
  },
  {
    key: "kanban",
    i18n_title: "project_modules.layout.kanban",
  },
];

export const MODULE_GROUP_BY_OPTIONS: {
  key: TModuleGroupByOptions;
  i18n_label: string;
}[] = [
  {
    key: "status",
    i18n_label: "project_modules.group_by.status",
  },
  {
    key: "lead",
    i18n_label: "project_modules.group_by.lead",
  },
  {
    key: "members",
    i18n_label: "project_modules.group_by.members",
  },
  {
    key: "label",
    i18n_label: "project_modules.group_by.label",
  },
  {
    key: "start_date",
    i18n_label: "project_modules.group_by.start_date",
  },
  {
    key: "target_date",
    i18n_label: "project_modules.group_by.target_date",
  },
];

export const MODULE_ORDER_BY_OPTIONS: {
  key: TModuleOrderByOptions;
  i18n_label: string;
}[] = [
  {
    key: "name",
    i18n_label: "project_modules.order_by.name",
  },
  {
    key: "progress",
    i18n_label: "project_modules.order_by.progress",
  },
  {
    key: "issues_length",
    i18n_label: "project_modules.order_by.issues",
  },
  {
    key: "start_date",
    i18n_label: "project_modules.order_by.start_date",
  },
  {
    key: "target_date",
    i18n_label: "project_modules.order_by.due_date",
  },
  {
    key: "created_at",
    i18n_label: "project_modules.order_by.created_at",
  },
  {
    key: "sort_order",
    i18n_label: "project_modules.order_by.manual",
  },
];

export const MODULE_DISPLAY_PROPERTIES: {
  key: TModuleDisplayPropertyKey;
  i18n_label: string;
}[] = [
  { key: "lead", i18n_label: "project_modules.display_property.lead" },
  { key: "members", i18n_label: "project_modules.display_property.members" },
  { key: "labels", i18n_label: "project_modules.display_property.labels" },
  { key: "start_date", i18n_label: "project_modules.display_property.start_date" },
  { key: "target_date", i18n_label: "project_modules.display_property.target_date" },
  { key: "progress", i18n_label: "project_modules.display_property.progress" },
  { key: "issue_count", i18n_label: "project_modules.display_property.issue_count" },
];

export const MODULE_DEFAULT_DISPLAY_PROPERTIES: TModuleDisplayProperties = {
  lead: true,
  members: false,
  labels: true,
  start_date: true,
  target_date: true,
  progress: true,
  issue_count: true,
};
