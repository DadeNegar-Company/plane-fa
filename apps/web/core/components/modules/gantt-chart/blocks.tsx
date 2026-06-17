/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
// ui
import { MODULE_STATUS } from "@plane/constants";
import { ModuleStatusIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { generateQueryParams } from "@plane/utils";
// components
import { SIDEBAR_WIDTH } from "@/components/gantt-chart/constants";
import { getBlockViewDetails } from "@/components/issues/issue-layouts/utils";
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";

type Props = {
  moduleId: string;
};

export const ModuleGanttBlock = observer(function ModuleGanttBlock(props: Props) {
  const { moduleId } = props;
  // router
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { workspaceSlug } = useParams();
  // store hooks
  const { getModuleById } = useModule();
  // derived values
  const moduleDetails = getModuleById(moduleId);
  // hooks
  const { isMobile } = usePlatformOS();

  const { message, blockStyle } = getBlockViewDetails(
    moduleDetails,
    MODULE_STATUS.find((s) => s.value === moduleDetails?.status)?.color ?? ""
  );

  const handleModulePeek = () => {
    if (isMobile) {
      router.push(`/${workspaceSlug?.toString()}/projects/${moduleDetails?.project_id}/modules/${moduleDetails?.id}`);
      return;
    }
    const query = generateQueryParams(searchParams, ["peekModule"]);
    if (searchParams.has("peekModule") && searchParams.get("peekModule") === moduleId) {
      router.push(`${pathname}?${query}`);
    } else {
      router.push(`${pathname}?${query && `${query}&`}peekModule=${moduleId}`);
    }
  };

  return (
    <Tooltip
      isMobile={isMobile}
      tooltipContent={
        <div className="space-y-1">
          <h5>{moduleDetails?.name}</h5>
          <div>{message}</div>
        </div>
      }
      position="top-start"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative flex h-full w-full cursor-pointer items-center rounded-sm"
        style={blockStyle}
        onClick={handleModulePeek}
      >
        <div className="absolute left-0 top-0 h-full w-full bg-surface-1/50" />
        <div
          dir="auto"
          className="sticky w-auto overflow-hidden truncate px-2.5 py-1 text-13 text-primary"
          style={{ left: `${SIDEBAR_WIDTH}px` }}
        >
          {moduleDetails?.name}
        </div>
      </div>
    </Tooltip>
  );
});

export const ModuleGanttSidebarBlock = observer(function ModuleGanttSidebarBlock(props: Props) {
  const { moduleId } = props;
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { workspaceSlug } = useParams();
  // store hooks
  const { getModuleById } = useModule();
  // derived values
  const moduleDetails = getModuleById(moduleId);
  // hooks
  const { isMobile } = usePlatformOS();

  const handleModulePeek = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile) {
      router.push(`/${workspaceSlug?.toString()}/projects/${moduleDetails?.project_id}/modules/${moduleDetails?.id}`);
      return;
    }
    const query = generateQueryParams(searchParams, ["peekModule"]);
    if (searchParams.has("peekModule") && searchParams.get("peekModule") === moduleId) {
      router.push(`${pathname}?${query}`);
    } else {
      router.push(`${pathname}?${query && `${query}&`}peekModule=${moduleId}`);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="relative flex h-full w-full cursor-pointer items-center gap-2" onClick={handleModulePeek}>
      <ModuleStatusIcon status={moduleDetails?.status ?? "backlog"} height="16px" width="16px" />
      <h6 dir="auto" className="flex-grow truncate text-13 font-medium">
        {moduleDetails?.name}
      </h6>
    </div>
  );
});
