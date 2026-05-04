/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IWorkspaceIntegration } from "@plane/types";
// assets
import GithubLogo from "@/app/assets/logos/github-square.png?url";
import SlackLogo from "@/app/assets/services/slack.png?url";
// components
import { SelectChannel } from "@/components/integration/slack/select-channel";
import { SelectRepository } from "@/components/integration/github/select-repository";
// constants
import { PROJECT_GITHUB_REPOSITORY } from "@/constants/fetch-keys";
// services
import { ProjectService } from "@/services/project";

type Props = {
  integration: IWorkspaceIntegration;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const integrationDetails: { [key: string]: any } = {
  github: {
    logo: GithubLogo,
    description: "Select GitHub repository to enable sync.",
  },
  slack: {
    logo: SlackLogo,
    description: "Get regular updates and control which notification you want to receive.",
  },
};

// services
const projectService = new ProjectService();

export function IntegrationCard({ integration }: Props) {
  const { workspaceSlug, projectId } = useParams();
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: syncedGithubRepository } = useSWR(projectId ? PROJECT_GITHUB_REPOSITORY(projectId) : null, () =>
    workspaceSlug && projectId && integration
      ? projectService.getProjectGithubRepository(workspaceSlug, projectId, integration.id)
      : null
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (repo: any) => {
    if (!workspaceSlug || !projectId || !integration) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      html_url,
      owner: { login },
      id,
      name,
    } = repo;

    projectService
      .syncGithubRepository(workspaceSlug, projectId, integration.id, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        owner: login,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        repository_id: id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        url: html_url,
      })
      // eslint-disable-next-line promise/always-return
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        mutate(PROJECT_GITHUB_REPOSITORY(projectId));

        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("common.success"),
          message: `${login}/${name} repository synced with the project successfully.`,
        });
      })
      .catch((err) => {
        console.error(err);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          message: t("workspace_projects_toasts.integration.sync_error"),
        });
      });
  };

  return (
    <>
      {integration && (
        <div className="flex items-center justify-between gap-2 border-b border-subtle bg-surface-1 px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 flex-shrink-0">
              <img
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                src={integrationDetails[integration.integration_detail.provider].logo}
                className="w-full h-full object-cover"
                alt={`${integration.integration_detail.title} Logo`}
              />
            </div>
            <div>
              <h3 className="flex items-center gap-4 text-13 font-medium">{integration.integration_detail.title}</h3>
              <p className="text-13 tracking-tight text-secondary">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {integrationDetails[integration.integration_detail.provider].description}
              </p>
            </div>
          </div>
          {integration.integration_detail.provider === "github" && (
            <SelectRepository
              integration={integration}
              value={
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                syncedGithubRepository && syncedGithubRepository.length > 0
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `${syncedGithubRepository[0].repo_detail.owner}/${syncedGithubRepository[0].repo_detail.name}`
                  : null
              }
              label={
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                syncedGithubRepository && syncedGithubRepository.length > 0
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `${syncedGithubRepository[0].repo_detail.owner}/${syncedGithubRepository[0].repo_detail.name}`
                  : "Select Repository"
              }
              onChange={handleChange}
            />
          )}
          {integration.integration_detail.provider === "slack" && <SelectChannel integration={integration} />}
        </div>
      )}
    </>
  );
}
