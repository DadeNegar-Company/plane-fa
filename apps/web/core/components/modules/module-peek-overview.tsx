/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { usePathname, useSearchParams } from "next/navigation";
// hooks
import { generateQueryParams } from "@plane/utils";
import { ChevronRightIcon } from "@plane/propel/icons";
import { useModule } from "@/hooks/store/use-module";
import { useAppRouter } from "@/hooks/use-app-router";
// components
import { ModuleAnalyticsSidebar } from "./";

type Props = {
  projectId: string;
  workspaceSlug: string;
  isArchived?: boolean;
};

export const ModulePeekOverview = observer(function ModulePeekOverview({
  projectId,
  workspaceSlug,
  isArchived = false,
}: Props) {
  // router
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekModule = searchParams.get("peekModule");
  // refs
  const ref = React.useRef(null);
  // store hooks
  const { fetchModuleDetails, fetchArchivedModuleDetails } = useModule();

  const handleClose = () => {
    const query = generateQueryParams(searchParams, ["peekModule"]);
    router.push(`${pathname}?${query}`);
  };

  useEffect(() => {
    if (!peekModule) return;
    if (isArchived) void fetchArchivedModuleDetails(workspaceSlug, projectId, peekModule.toString());
    else void fetchModuleDetails(workspaceSlug, projectId, peekModule.toString());
  }, [fetchArchivedModuleDetails, fetchModuleDetails, isArchived, peekModule, projectId, workspaceSlug]);

  return (
    <>
      {peekModule && (
        <div
          ref={ref}
          className="flex h-full w-full max-w-[24rem] flex-shrink-0 flex-col gap-3.5 overflow-y-auto border-l border-subtle bg-surface-1 px-6 duration-300 absolute md:relative right-0 z-[9]"
          style={{
            boxShadow:
              "0px 1px 4px 0px rgba(0, 0, 0, 0.06), 0px 2px 4px 0px rgba(16, 24, 40, 0.06), 0px 1px 8px -1px rgba(16, 24, 40, 0.06)",
          }}
        >
          <div className="sticky z-10 top-0 flex items-center bg-surface-1 pb-2 pt-5">
            <button className="flex h-5 w-5 items-center justify-center rounded-full bg-layer-3" onClick={handleClose}>
              <ChevronRightIcon className="h-3 w-3 stroke-2 text-on-color" />
            </button>
          </div>
          <ModuleAnalyticsSidebar moduleId={peekModule?.toString() ?? ""} isArchived={isArchived} />
        </div>
      )}
    </>
  );
});
