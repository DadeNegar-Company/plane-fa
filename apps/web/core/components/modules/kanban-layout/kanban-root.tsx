/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Circle, Minimize2, Maximize2 } from "lucide-react";
import { PlusIcon } from "@plane/propel/icons";
import type { IModule, TModuleGroupByOptions, IBaseLayoutsBaseGroup, IGroupHeaderProps } from "@plane/types";
// components
import { BaseKanbanLayout } from "@/components/base-layouts/kanban/layout";
import { ModuleCardItem } from "@/components/modules/module-card-item";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useModule } from "@/hooks/store/use-module";

type Props = {
  groupedModuleIds: Record<string, string[]>;
  groupBy: TModuleGroupByOptions;
  groups: IBaseLayoutsBaseGroup[];
  items: Record<string, IModule>;
  showEmptyGroups?: boolean;
};

export const ModuleKanbanRoot = observer(function ModuleKanbanRoot(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { groupedModuleIds, groupBy, groups, items, showEmptyGroups = true } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // hooks
  const { updateModuleDetails } = useModule();
  const { toggleCreateModuleModal } = useCommandPalette();

  // Handle drag & drop
  const handleDrop = useCallback(
    async (sourceId: string, _destinationId: string | null, sourceGroupId: string, destinationGroupId: string) => {
      if (!workspaceSlug || !projectId || sourceGroupId === destinationGroupId) return;

      const update: Partial<IModule> = {};

      switch (groupBy) {
        case "status":
          update.status = destinationGroupId as IModule["status"];
          break;
        case "lead":
          update.lead_id = destinationGroupId === "none" ? null : destinationGroupId;
          break;
        default:
          return;
      }

      await updateModuleDetails(workspaceSlug.toString(), projectId.toString(), sourceId, update);
    },
    [workspaceSlug, projectId, groupBy, updateModuleDetails]
  );

  // Only allow drag for status and lead grouping
  const enableDragDrop = groupBy === "status" || groupBy === "lead";

  // Custom group header with add button — matches issue kanban HeaderGroupByCard
  const renderGroupHeader = useCallback(
    ({ group, itemCount, isCollapsed, onToggleGroup }: IGroupHeaderProps) => (
      <div
        className={`relative flex flex-shrink-0 gap-1 py-1.5 ${
          isCollapsed ? "w-[44px] flex-col items-center" : "w-full flex-row items-center"
        }`}
      >
        <div className="flex size-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-xs">
          {group.icon ? group.icon : <Circle width={14} strokeWidth={2} />}
        </div>
        <div
          className={`relative flex gap-1 ${
            isCollapsed ? "flex-col items-center" : "w-full flex-row items-baseline overflow-hidden"
          }`}
        >
          <div
            className={`line-clamp-1 inline-block overflow-hidden truncate font-medium text-primary ${
              isCollapsed ? "vertical-lr max-h-[400px]" : ""
            }`}
          >
            {group.name}
          </div>
          <div className={`flex-shrink-0 text-13 font-medium text-tertiary ${isCollapsed ? "pr-0.5" : "pl-2"}`}>
            {itemCount}
          </div>
        </div>
        <button
          className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover bg-layer-transparent"
          onClick={() => onToggleGroup(group.id)}
        >
          {isCollapsed ? <Maximize2 width={14} strokeWidth={2} /> : <Minimize2 width={14} strokeWidth={2} />}
        </button>
        {!isCollapsed && (
          <button
            className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover bg-layer-transparent"
            onClick={() => toggleCreateModuleModal(true)}
          >
            <PlusIcon width={14} strokeWidth={2} />
          </button>
        )}
      </div>
    ),
    [toggleCreateModuleModal]
  );

  return (
    <BaseKanbanLayout
      items={items}
      groups={groups}
      groupedItemIds={groupedModuleIds}
      renderItem={(item) => <ModuleCardItem moduleId={item.id} />}
      renderGroupHeader={renderGroupHeader}
      enableDragDrop={enableDragDrop}
      onDrop={handleDrop}
      showEmptyGroups={showEmptyGroups}
      className="h-full"
    />
  );
});
