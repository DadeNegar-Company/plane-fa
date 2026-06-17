/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { PanelRight } from "lucide-react";
import { useTranslation } from "@plane/i18n";
// assets
import emptyModule from "@/app/assets/empty-state/module.svg?url";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
import { ModuleLayoutRoot } from "@/components/issues/issue-layouts/roots/module-layout-root";
import { ModuleAnalyticsSidebar } from "@/components/modules";
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Route } from "./+types/page";

// eslint-disable-next-line react-refresh/only-export-components
function ModuleIssuesPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation();
  // router
  const router = useAppRouter();

  const { workspaceSlug, projectId, moduleId } = params;
  // store hooks
  const { fetchModuleDetails, getModuleById } = useModule();
  const { getProjectById } = useProject();
  // local storage
  const { setValue, storedValue } = useLocalStorage("module_sidebar_collapsed_v2", "false");
  const isSidebarCollapsed = storedValue ? storedValue === "true" : false;
  // fetching module details
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { error } = useSWR(`CURRENT_MODULE_DETAILS_${moduleId}`, () =>
    fetchModuleDetails(workspaceSlug, projectId, moduleId)
  );
  // derived values
  const projectModule = getModuleById(moduleId);
  const project = getProjectById(projectId);
  const pageTitle = project?.name && projectModule?.name ? `${project?.name} - ${projectModule?.name}` : undefined;

  const toggleSidebar = () => {
    setValue(`${!isSidebarCollapsed}`);
  };

  return (
    <>
      <PageHead title={pageTitle} />
      {error ? (
        <EmptyState
          image={emptyModule}
          title={t("project_modules_extra.not_found_title")}
          description="The module you are looking for does not exist or has been deleted."
          primaryButton={{
            text: "View other modules",
            onClick: () => router.push(`/${workspaceSlug}/projects/${projectId}/modules`),
          }}
        />
      ) : (
        <div className="relative flex h-full w-full overflow-hidden">
          {/* Main content — stays full width; the sidebar floats over it so toggling never reflows the list */}
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ModuleLayoutRoot />
            </div>
          </div>

          {/* Module info sidebar — overlay floating on top of the content (mirrors the work-item peek),
              open by default. Closing it does not reflow the work items. */}
          {!isSidebarCollapsed && (
            <aside
              className="absolute bottom-0 end-0 top-0 z-[15] flex h-full w-full flex-col border-s border-subtle bg-surface-1 md:w-[50%]"
              style={{
                boxShadow:
                  "0px 4px 8px 0px rgba(0, 0, 0, 0.12), 0px 6px 12px 0px rgba(16, 24, 40, 0.12), 0px 1px 16px 0px rgba(16, 24, 40, 0.12)",
              }}
            >
              {/* Close button — header also has a toggle to reopen */}
              <div className="flex shrink-0 items-center px-4 pb-2 pt-5">
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-sm text-tertiary hover:bg-layer-transparent-hover hover:text-primary"
                  onClick={toggleSidebar}
                  title="Close sidebar"
                >
                  <PanelRight className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <ModuleAnalyticsSidebar moduleId={moduleId} />
              </div>
            </aside>
          )}
        </div>
      )}
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default observer(ModuleIssuesPage);
