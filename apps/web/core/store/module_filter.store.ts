/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { set } from "lodash-es";
import { action, computed, observable, makeObservable, runInAction, reaction } from "mobx";
import { computedFn } from "mobx-utils";
// types
import type { TModuleDisplayFilters, TModuleFilters, TModuleFiltersByState } from "@plane/types";
// constants
import { MODULE_DEFAULT_DISPLAY_PROPERTIES } from "@plane/constants";
// helpers
import { storage } from "@/lib/local-storage";
// store
import type { CoreRootStore } from "./root.store";

// localStorage keys
const MODULE_DISPLAY_FILTERS_KEY = "module_display_filters";
const MODULE_FILTERS_KEY = "module_filters";

export interface IModuleFilterStore {
  // observables
  displayFilters: Record<string, TModuleDisplayFilters>;
  filters: Record<string, TModuleFiltersByState>;
  searchQuery: string;
  archivedModulesSearchQuery: string;
  // computed
  currentProjectDisplayFilters: TModuleDisplayFilters | undefined;
  currentProjectFilters: TModuleFilters | undefined;
  currentProjectArchivedFilters: TModuleFilters | undefined;
  // computed functions
  getDisplayFiltersByProjectId: (projectId: string) => TModuleDisplayFilters | undefined;
  getFiltersByProjectId: (projectId: string) => TModuleFilters | undefined;
  getArchivedFiltersByProjectId: (projectId: string) => TModuleFilters | undefined;
  // actions
  updateDisplayFilters: (projectId: string, displayFilters: TModuleDisplayFilters) => void;
  updateFilters: (projectId: string, filters: TModuleFilters, state?: keyof TModuleFiltersByState) => void;
  updateSearchQuery: (query: string) => void;
  updateArchivedModulesSearchQuery: (query: string) => void;
  clearAllFilters: (projectId: string, state?: keyof TModuleFiltersByState) => void;
}

export class ModuleFilterStore implements IModuleFilterStore {
  // observables
  displayFilters: Record<string, TModuleDisplayFilters> = {};
  filters: Record<string, TModuleFiltersByState> = {};
  searchQuery: string = "";
  archivedModulesSearchQuery: string = "";
  // root store
  rootStore: CoreRootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      displayFilters: observable,
      filters: observable,
      searchQuery: observable.ref,
      archivedModulesSearchQuery: observable.ref,
      // computed
      currentProjectDisplayFilters: computed,
      currentProjectFilters: computed,
      currentProjectArchivedFilters: computed,
      // actions
      updateDisplayFilters: action,
      updateFilters: action,
      updateSearchQuery: action,
      updateArchivedModulesSearchQuery: action,
      clearAllFilters: action,
    });
    // root store
    this.rootStore = _rootStore;

    // initialize display filters of the current project
    reaction(
      () => this.rootStore.router.projectId,
      (projectId) => {
        if (!projectId) return;
        this.initProjectModuleFilters(projectId);
        this.searchQuery = "";
      }
    );

    // Load initial data from localStorage after reactions are set up
    this.loadFromLocalStorage();
  }

  /**
   * @description Load filters from localStorage
   */
  loadFromLocalStorage = () => {
    try {
      const displayFiltersData = storage.get(MODULE_DISPLAY_FILTERS_KEY);
      const filtersData = storage.get(MODULE_FILTERS_KEY);

      runInAction(() => {
        if (displayFiltersData) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(displayFiltersData);
          if (typeof parsed === "object" && parsed !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.displayFilters = parsed;
          }
        }
        if (filtersData) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(filtersData);
          if (typeof parsed === "object" && parsed !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.filters = parsed;
          }
        }
      });
    } catch (error) {
      console.error("Failed to load module filters from localStorage:", error);
      // Reset to defaults on error
      runInAction(() => {
        this.displayFilters = {};
        this.filters = {};
      });
    }
  };

  /**
   * @description Save display filters to localStorage (debounced)
   */
  saveDisplayFiltersToLocalStorage = () => {
    storage.set(MODULE_DISPLAY_FILTERS_KEY, this.displayFilters);
  };

  /**
   * @description Save filters to localStorage (debounced)
   */
  saveFiltersToLocalStorage = () => {
    storage.set(MODULE_FILTERS_KEY, this.filters);
  };

  /**
   * @description get display filters of the current project
   */
  get currentProjectDisplayFilters() {
    const projectId = this.rootStore.router.projectId;
    if (!projectId) return;
    return this.displayFilters[projectId];
  }

  /**
   * @description get filters of the current project
   */
  get currentProjectFilters() {
    const projectId = this.rootStore.router.projectId;
    if (!projectId) return;
    return this.filters[projectId]?.default ?? {};
  }

  /**
   * @description get archived filters of the current project
   */
  get currentProjectArchivedFilters() {
    const projectId = this.rootStore.router.projectId;
    if (!projectId) return;
    return this.filters[projectId]?.archived;
  }

  /**
   * @description get display filters of a project by projectId
   * @param {string} projectId
   */
  getDisplayFiltersByProjectId = computedFn((projectId: string) => this.displayFilters[projectId]);

  /**
   * @description get filters of a project by projectId
   * @param {string} projectId
   */
  getFiltersByProjectId = computedFn((projectId: string) => this.filters[projectId]?.default ?? {});

  /**
   * @description get archived filters of a project by projectId
   * @param {string} projectId
   */
  getArchivedFiltersByProjectId = computedFn((projectId: string) => this.filters[projectId]?.archived);

  /**
   * @description initialize display filters and filters of a project
   * @param {string} projectId
   */
  initProjectModuleFilters = (projectId: string) => {
    const displayFilters = this.getDisplayFiltersByProjectId(projectId);
    runInAction(() => {
      const layout = displayFilters?.layout || "list";

      const groupBy = displayFilters?.group_by ?? null;

      const resolvedLayout = layout === "kanban" && !groupBy ? "list" : layout;
      // sub_group_by is only valid for kanban layout
      const subGroupBy = resolvedLayout === "kanban" ? (displayFilters?.sub_group_by ?? null) : null;
      this.displayFilters[projectId] = {
        favorites: displayFilters?.favorites || false,
        layout: resolvedLayout,
        // [FA-CUSTOM] Gantt defaults to start-date ordering; other layouts keep name order
        order_by: displayFilters?.order_by || (resolvedLayout === "gantt" ? "start_date" : "name"),
        group_by: groupBy,
        sub_group_by: subGroupBy,
        show_empty_groups: displayFilters?.show_empty_groups ?? true,
        display_properties: displayFilters?.display_properties ?? { ...MODULE_DEFAULT_DISPLAY_PROPERTIES },
      };

      this.filters[projectId] = this.filters[projectId] ?? {
        default: {},
        archived: {},
      };
    });
    this.saveDisplayFiltersToLocalStorage();
    this.saveFiltersToLocalStorage();
  };

  /**
   * @description update display filters of a project
   * @param {string} projectId
   * @param {TModuleDisplayFilters} displayFilters
   */
  updateDisplayFilters = (projectId: string, displayFilters: TModuleDisplayFilters) => {
    runInAction(() => {
      Object.keys(displayFilters).forEach((key) => {
        set(this.displayFilters, [projectId, key], displayFilters[key as keyof TModuleDisplayFilters]);
      });
      // clear sub_group_by when switching away from kanban layout
      if (displayFilters.layout && displayFilters.layout !== "kanban") {
        set(this.displayFilters, [projectId, "sub_group_by"], null);
      }
      // [FA-CUSTOM] when switching to the Gantt timeline (without setting an order in the same
      // update), default ordering to start date if it is still the list default (name).
      if (
        displayFilters.layout === "gantt" &&
        displayFilters.order_by === undefined &&
        this.displayFilters[projectId]?.order_by === "name"
      ) {
        set(this.displayFilters, [projectId, "order_by"], "start_date");
      }
    });
    this.saveDisplayFiltersToLocalStorage();
  };

  /**
   * @description update filters of a project
   * @param {string} projectId
   * @param {TModuleFilters} filters
   */
  updateFilters = (projectId: string, filters: TModuleFilters, state: keyof TModuleFiltersByState = "default") => {
    runInAction(() => {
      Object.keys(filters).forEach((key) => {
        set(this.filters, [projectId, state, key], filters[key as keyof TModuleFilters]);
      });
    });
    this.saveFiltersToLocalStorage();
  };

  /**
   * @description update search query
   * @param {string} query
   */
  updateSearchQuery = (query: string) => {
    this.searchQuery = query;
  };

  /**
   * @description update archived search query
   * @param {string} query
   */
  updateArchivedModulesSearchQuery = (query: string) => {
    this.archivedModulesSearchQuery = query;
  };

  /**
   * @description clear all filters of a project
   * @param {string} projectId
   */
  clearAllFilters = (projectId: string, state: keyof TModuleFiltersByState = "default") => {
    runInAction(() => {
      if (!this.filters[projectId]) this.filters[projectId] = { default: {}, archived: {} };
      this.filters[projectId][state] = {};
      if (this.displayFilters[projectId]) this.displayFilters[projectId].favorites = false;
    });
    this.saveFiltersToLocalStorage();
    this.saveDisplayFiltersToLocalStorage();
  };
}
