/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Service for time tracking / worklogs

import { API_BASE_URL } from "@plane/constants";
import type { TIssueWorklog } from "@plane/types";
import { APIService } from "@/services/api.service";

export class IssueWorklogService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getIssueWorklogs(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueWorklog[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/worklogs/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createIssueWorklog(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueWorklog>
  ): Promise<TIssueWorklog> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/worklogs/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async patchIssueWorklog(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string,
    data: Partial<TIssueWorklog>
  ): Promise<TIssueWorklog> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/worklogs/${worklogId}/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueWorklog(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    worklogId: string
  ): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/worklogs/${worklogId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // [FA-CUSTOM] Project-level timesheet
  async getProjectTimesheet(
    workspaceSlug: string,
    projectId: string,
    params?: { date_from?: string; date_to?: string; actor_id?: string }
  ): Promise<TIssueWorklog[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/timesheet/`, { params })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
