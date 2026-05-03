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
  // sub-group props
  subGroupedModuleIds?: Record<string, Record<string, string[]>>;
  subGroupBy?: TModuleGroupByOptions;
  subGroups?: IBaseLayoutsBaseGroup[];
};

/** Renders a single kanban column with sub-group sections inside */
const SubGroupColumn = observer(function SubGroupColumn({
  group,
  subGroups,
  subGroupedIds,
  showEmptyGroups,
}: {
  group: IBaseLayoutsBaseGroup;
  subGroups: IBaseLayoutsBaseGroup[];
  subGroupedIds: Record<string, string[]>;
  showEmptyGroups?: boolean;
}) {
  // We can't use useState inside a callback, so we keep this component simple — all sub-groups start expanded.
  const visibleSubGroups = subGroups.filter((sg) => {
    const ids = subGroupedIds[sg.id] ?? [];
    return showEmptyGroups || ids.length > 0;
  });

  return (
    <div className="flex h-full w-[280px] flex-shrink-0 flex-col rounded-md border border-subtle bg-layer-1 pb-2">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 text-13 font-semibold text-primary">
        {group.icon && <span className="flex h-4 w-4 items-center justify-center">{group.icon}</span>}
        <span className="flex-1 truncate">{group.name}</span>
        <span className="text-11 font-normal text-tertiary">{Object.values(subGroupedIds).flat().length}</span>
      </div>
      {/* Sub-group sections */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {visibleSubGroups.map((sg) => {
          const moduleIds = subGroupedIds[sg.id] ?? [];
          return (
            <div key={sg.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-1 py-0.5 text-11 font-medium text-tertiary">
                {sg.icon && <span className="flex h-3 w-3 items-center justify-center">{sg.icon}</span>}
                <span className="truncate">{sg.name}</span>
                <span className="ms-auto">{moduleIds.length}</span>
              </div>
              {moduleIds.map((id) => (
                <div key={id} className="rounded-sm">
                  <ModuleCardItem moduleId={id} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export const ModuleKanbanRoot = observer(function ModuleKanbanRoot(props: Props) {
  const {
    groupedModuleIds,
    groupBy,
    groups,
    items,
    showEmptyGroups = true,
    subGroupedModuleIds,
    subGroupBy,
    subGroups,
  } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // hooks
  const { updateModuleDetails } = useModule();
  const { toggleCreateModuleModal } = useCommandPalette();

  // Handle drag & drop (flat grouping only)
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

  // Only allow drag for status and lead grouping (and no sub-group mode)
  const enableDragDrop = !subGroupBy && (groupBy === "status" || groupBy === "lead");

  // Custom group header with add button
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
          <div className={`flex-shrink-0 text-13 font-medium text-tertiary ${isCollapsed ? "pe-0.5" : "ps-2"}`}>
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

  // Sub-grouped kanban: render columns manually with nested sub-group sections
  if (subGroupBy && subGroupedModuleIds && subGroups) {
    const visibleGroups = groups.filter((g) => {
      if (!showEmptyGroups) {
        const total = Object.values(subGroupedModuleIds[g.id] ?? {}).flat().length;
        return total > 0;
      }
      return true;
    });

    return (
      <div className="horizontal-scrollbar scrollbar-lg flex h-full w-full gap-4 overflow-x-auto bg-surface-2 px-3 pt-2">
        {visibleGroups.map((group) => (
          <SubGroupColumn
            key={group.id}
            group={group}
            subGroups={subGroups}
            subGroupedIds={subGroupedModuleIds[group.id] ?? {}}
            showEmptyGroups={showEmptyGroups}
          />
        ))}
      </div>
    );
  }

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
