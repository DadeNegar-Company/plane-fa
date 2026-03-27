/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { sortBy } from "lodash-es";
// plane imports
import type {
  IModule,
  TModuleDisplayFilters,
  TModuleFilters,
  TModuleGroupByOptions,
  TModuleOrderByOptions,
} from "@plane/types";
// local imports
import { getDate } from "./datetime";
import { satisfiesDateFilter } from "./filter";

const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });

/**
 * @description performs natural sorting of strings (handles numbers within strings correctly)
 * @param {string} a - first string to compare
 * @param {string} b - second string to compare
 * @returns {number} - comparison result (-1, 0, or 1)
 */
const naturalSort = (a: string, b: string): number => collator.compare(a, b);
/**
 * @description orders modules based on their status
 * @param {IModule[]} modules
 * @param {TModuleOrderByOptions | undefined} orderByKey
 * @returns {IModule[]}
 */
export const orderModules = (modules: IModule[], orderByKey: TModuleOrderByOptions | undefined): IModule[] => {
  let orderedModules: IModule[] = [];
  if (modules.length === 0 || !orderByKey) return [];

  if (orderByKey === "name") orderedModules = [...modules].sort((a, b) => naturalSort(a.name, b.name));
  if (orderByKey === "-name") orderedModules = [...modules].sort((a, b) => naturalSort(b.name, a.name));
  if (["progress", "-progress"].includes(orderByKey))
    orderedModules = sortBy(modules, [
      (m) => {
        let progress = (m.completed_issues + m.cancelled_issues) / m.total_issues;
        if (isNaN(progress)) progress = 0;
        return orderByKey === "progress" ? progress : -progress;
      },
    ]);
  if (["issues_length", "-issues_length"].includes(orderByKey))
    orderedModules = sortBy(modules, [(m) => (orderByKey === "issues_length" ? m.total_issues : !m.total_issues)]);
  if (orderByKey === "target_date") orderedModules = sortBy(modules, [(m) => m.target_date]);
  if (orderByKey === "-target_date") orderedModules = sortBy(modules, [(m) => !m.target_date]);
  if (orderByKey === "created_at") orderedModules = sortBy(modules, [(m) => m.created_at]);
  if (orderByKey === "-created_at") orderedModules = sortBy(modules, [(m) => !m.created_at]);

  if (orderByKey === "sort_order") orderedModules = sortBy(modules, [(m) => m.sort_order]);
  return orderedModules;
};

/**
 * @description filters modules based on the filters
 * @param {IModule} module
 * @param {TModuleDisplayFilters} displayFilters
 * @param {TModuleFilters} filters
 * @returns {boolean}
 */
export const shouldFilterModule = (
  module: IModule,
  displayFilters: TModuleDisplayFilters,
  filters: TModuleFilters
): boolean => {
  let fallsInFilters = true;
  Object.keys(filters).forEach((key) => {
    const filterKey = key as keyof TModuleFilters;
    if (filterKey === "status" && filters.status && filters.status.length > 0)
      fallsInFilters = fallsInFilters && filters.status.includes(module.status?.toLowerCase() ?? "");
    if (filterKey === "lead" && filters.lead && filters.lead.length > 0)
      fallsInFilters = fallsInFilters && filters.lead.includes(`${module.lead_id}`);
    if (filterKey === "members" && filters.members && filters.members.length > 0) {
      const memberIds = module.member_ids;
      fallsInFilters = fallsInFilters && filters.members.some((memberId) => memberIds.includes(memberId));
    }
    if (filterKey === "label" && filters.label && filters.label.length > 0) {
      const labelIds = module.label_ids ?? [];
      fallsInFilters = fallsInFilters && filters.label.some((labelId) => labelIds.includes(labelId));
    }
    if (filterKey === "start_date" && filters.start_date && filters.start_date.length > 0) {
      const startDate = getDate(module.start_date);
      filters.start_date.forEach((dateFilter) => {
        fallsInFilters = fallsInFilters && !!startDate && satisfiesDateFilter(startDate, dateFilter);
      });
    }
    if (filterKey === "target_date" && filters.target_date && filters.target_date.length > 0) {
      const endDate = getDate(module.target_date);
      filters.target_date.forEach((dateFilter) => {
        fallsInFilters = fallsInFilters && !!endDate && satisfiesDateFilter(endDate, dateFilter);
      });
    }
  });
  if (displayFilters.favorites && !module.is_favorite) fallsInFilters = false;

  return fallsInFilters;
};

/**
 * @description groups modules based on the group_by key
 * @param {IModule[]} modules
 * @param {TModuleGroupByOptions} groupByKey
 * @returns {Record<string, string[]>} - map of group key to array of module IDs
 */
export const groupModules = (modules: IModule[], groupByKey: TModuleGroupByOptions): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  if (!groupByKey) return { all: modules.map((m) => m.id) };

  const addToGroup = (key: string, moduleId: string) => {
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(moduleId);
  };

  const formatDateKey = (dateStr: string | null): string => {
    if (!dateStr) return "none";
    const date = getDate(dateStr);
    if (!date) return "none";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  for (const module of modules) {
    switch (groupByKey) {
      case "status":
        addToGroup(module.status ?? "backlog", module.id);
        break;
      case "lead":
        addToGroup(module.lead_id ?? "none", module.id);
        break;
      case "members":
        if (module.member_ids && module.member_ids.length > 0) {
          module.member_ids.forEach((memberId) => addToGroup(memberId, module.id));
        } else {
          addToGroup("none", module.id);
        }
        break;
      case "label":
        if (module.label_ids && module.label_ids.length > 0) {
          module.label_ids.forEach((labelId) => addToGroup(labelId, module.id));
        } else {
          addToGroup("none", module.id);
        }
        break;
      case "start_date":
        addToGroup(formatDateKey(module.start_date), module.id);
        break;
      case "target_date":
        addToGroup(formatDateKey(module.target_date), module.id);
        break;
    }
  }

  return grouped;
};
