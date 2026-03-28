/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import type { IModule, TModuleGroupByOptions , IBaseLayoutsBaseGroup } from "@plane/types";
// components
import { BaseKanbanLayout } from "@/components/base-layouts/kanban/layout";
import { ModuleCardItem } from "@/components/modules/module-card-item";
// hooks
import { useModule } from "@/hooks/store/use-module";

type Props = {
  groupedModuleIds: Record<string, string[]>;
  groupBy: TModuleGroupByOptions;
  groups: IBaseLayoutsBaseGroup[];
  items: Record<string, IModule>;
};

export const ModuleKanbanRoot = observer(function ModuleKanbanRoot(props: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { groupedModuleIds, groupBy, groups, items } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // hooks
  const { updateModuleDetails } = useModule();

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

  return (
    <BaseKanbanLayout
      items={items}
      groups={groups}
      groupedItemIds={groupedModuleIds}
      renderItem={(item) => <ModuleCardItem moduleId={item.id} />}
      enableDragDrop={enableDragDrop}
      onDrop={handleDrop}
      showEmptyGroups={groupBy === "status"}
      className="h-full"
    />
  );
});
