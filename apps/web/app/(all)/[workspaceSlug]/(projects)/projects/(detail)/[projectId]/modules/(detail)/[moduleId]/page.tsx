/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { PanelRight } from "lucide-react";
import { cn } from "@plane/utils";
// assets
import emptyModule from "@/app/assets/empty-state/module.svg?url";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
import { ModuleLayoutRoot } from "@/components/issues/issue-layouts/roots/module-layout-root";
import { ModuleAnalyticsSidebar, ModuleDescriptionBanner } from "@/components/modules";
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Route } from "./+types/page";

// eslint-disable-next-line react-refresh/only-export-components
function ModuleIssuesPage({ params }: Route.ComponentProps) {
  // router
  const router = useAppRouter();

  const { workspaceSlug, projectId, moduleId } = params;
  // store hooks
  const { fetchModuleDetails, getModuleById } = useModule();
  const { getProjectById } = useProject();
  // local storage
  const { setValue, storedValue } = useLocalStorage("module_sidebar_collapsed", "false");
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
          title="Module does not exist"
          description="The module you are looking for does not exist or has been deleted."
          primaryButton={{
            text: "View other modules",
            onClick: () => router.push(`/${workspaceSlug}/projects/${projectId}/modules`),
          }}
        />
      ) : (
        <div className="flex h-full w-full overflow-hidden">
          {/* Main content */}
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            {isSidebarCollapsed && (
              <ModuleDescriptionBanner moduleId={moduleId} workspaceSlug={workspaceSlug} projectId={projectId} />
            )}
            <div className="flex-1 overflow-hidden">
              <ModuleLayoutRoot />
            </div>
          </div>

          {/* Sidebar — same positioning pattern as issue detail sidebar */}
          <div
            className={cn(
              "fixed right-0 z-[5] flex h-full w-full min-w-[300px] flex-col border-l border-subtle bg-surface-1 transition-all duration-300 sm:w-1/2 md:relative md:w-1/4 lg:min-w-80 xl:min-w-[24rem]"
            )}
            style={isSidebarCollapsed ? { right: `-${typeof window !== "undefined" ? window.innerWidth : 0}px` } : {}}
          >
            {/* Sidebar toggle button — page-level, always accessible */}
            <div className="flex shrink-0 items-center px-4 pb-2 pt-5">
              <button
                className="flex h-5 w-5 items-center justify-center rounded-sm text-tertiary hover:bg-layer-transparent-hover hover:text-primary"
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ModuleAnalyticsSidebar moduleId={moduleId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default observer(ModuleIssuesPage);
