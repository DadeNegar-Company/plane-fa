/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] MobX store for time tracking / worklogs

import { pull, concat, update, uniq, set } from "lodash-es";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
// Plane Imports
import type { TIssueWorklog, TIssueWorklogMap, TIssueWorklogIdMap } from "@plane/types";
// services
import { IssueWorklogService } from "@/services/issue";
// types
import type { IIssueDetail } from "./root.store";

export type TWorklogLoader = "fetch" | "create" | "update" | "delete" | undefined;

export interface IIssueWorklogStoreActions {
  fetchWorklogs: (workspaceSlug: string, projectId: string, issueId: string) => Promise<TIssueWorklog[]>;
  createWorklog: (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueWorklog>
  ) => Promise<TIssueWorklog>;
  updateWorklog: (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string,
    data: Partial<TIssueWorklog>
  ) => Promise<TIssueWorklog>;
  removeWorklog: (workspaceSlug: string, projectId: string, issueId: string, worklogId: string) => Promise<void>;
}

export interface IIssueWorklogStore extends IIssueWorklogStoreActions {
  // observables
  loader: TWorklogLoader;
  worklogs: TIssueWorklogIdMap;
  worklogMap: TIssueWorklogMap;
  // helper methods
  getWorklogsByIssueId: (issueId: string) => string[] | undefined;
  getWorklogById: (worklogId: string) => TIssueWorklog | undefined;
  getTotalMinutesByIssueId: (issueId: string) => number;
}

export class IssueWorklogStore implements IIssueWorklogStore {
  // observables
  loader: TWorklogLoader = "fetch";
  worklogs: TIssueWorklogIdMap = {};
  worklogMap: TIssueWorklogMap = {};
  // root store
  rootIssueDetail: IIssueDetail;
  // services
  issueWorklogService;

  constructor(rootStore: IIssueDetail) {
    makeObservable(this, {
      // observables
      loader: observable.ref,
      worklogs: observable,
      worklogMap: observable,
      // actions
      fetchWorklogs: action,
      createWorklog: action,
      updateWorklog: action,
      removeWorklog: action,
    });
    this.rootIssueDetail = rootStore;
    this.issueWorklogService = new IssueWorklogService();
  }

  // helper methods
  getWorklogsByIssueId = (issueId: string) => {
    if (!issueId) return undefined;
    return this.worklogs[issueId] ?? undefined;
  };

  getWorklogById = (worklogId: string) => {
    if (!worklogId) return undefined;
    return this.worklogMap[worklogId] ?? undefined;
  };

  getTotalMinutesByIssueId = (issueId: string): number => {
    const worklogIds = this.getWorklogsByIssueId(issueId);
    if (!worklogIds) return 0;
    return worklogIds.reduce((total, id) => {
      const worklog = this.worklogMap[id];
      return total + (worklog?.duration_minutes ?? 0);
    }, 0);
  };

  fetchWorklogs = async (workspaceSlug: string, projectId: string, issueId: string) => {
    this.loader = "fetch";
    const worklogs = await this.issueWorklogService.getIssueWorklogs(workspaceSlug, projectId, issueId);

    const worklogIds = worklogs.map((w) => w.id);
    runInAction(() => {
      set(this.worklogs, issueId, worklogIds);
      worklogs.forEach((worklog) => {
        set(this.worklogMap, worklog.id, worklog);
      });
      this.loader = undefined;
    });

    return worklogs;
  };

  createWorklog = async (workspaceSlug: string, projectId: string, issueId: string, data: Partial<TIssueWorklog>) => {
    const response = await this.issueWorklogService.createIssueWorklog(workspaceSlug, projectId, issueId, data);

    runInAction(() => {
      update(this.worklogs, issueId, (_ids: string[] | undefined) => {
        if (!_ids) return [response.id];
        return uniq(concat(_ids, [response.id]));
      });
      set(this.worklogMap, response.id, response);
    });

    // refresh activity feed to pick up the backend-generated activity
    this.rootIssueDetail.activity.fetchActivities(workspaceSlug, projectId, issueId);

    return response;
  };

  updateWorklog = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string,
    data: Partial<TIssueWorklog>
  ) => {
    runInAction(() => {
      Object.keys(data).forEach((key) => {
        set(this.worklogMap, [worklogId, key], data[key as keyof TIssueWorklog]);
      });
    });

    const response = await this.issueWorklogService.patchIssueWorklog(
      workspaceSlug,
      projectId,
      issueId,
      worklogId,
      data
    );

    runInAction(() => {
      set(this.worklogMap, worklogId, response);
    });

    return response;
  };

  removeWorklog = async (workspaceSlug: string, projectId: string, issueId: string, worklogId: string) => {
    await this.issueWorklogService.deleteIssueWorklog(workspaceSlug, projectId, issueId, worklogId);

    runInAction(() => {
      pull(this.worklogs[issueId], worklogId);
      delete this.worklogMap[worklogId];
    });
  };
}
