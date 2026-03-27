/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { MODULE_STATUS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { ModuleStatusIcon } from "@plane/propel/icons";
import type { IModule, TModuleGroupByOptions } from "@plane/types";
import type { IBaseLayoutsBaseGroup } from "@plane/types";
// components
import { BaseKanbanLayout } from "@/components/base-layouts/kanban/layout";
import { ModuleCardItem } from "@/components/modules/module-card-item";
// hooks
import { useLabel } from "@/hooks/store/use-label";
import { useMember } from "@/hooks/store/use-member";
import { useModule } from "@/hooks/store/use-module";

type Props = {
  groupedModuleIds: Record<string, string[]>;
  groupBy: TModuleGroupByOptions;
};

export const ModuleKanbanRoot = observer(function ModuleKanbanRoot(props: Props) {
  const { groupedModuleIds, groupBy } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // hooks
  const { t } = useTranslation();
  const { moduleMap, updateModuleDetails } = useModule();
  const { getUserDetails } = useMember();
  const { getLabelById } = useLabel();

  // Build groups definition based on groupBy
  const groups: IBaseLayoutsBaseGroup[] = useMemo(() => {
    if (!groupBy) return [];

    const groupKeys = Object.keys(groupedModuleIds);

    switch (groupBy) {
      case "status":
        // Show all statuses in order, even if empty
        return MODULE_STATUS.map((status) => ({
          id: status.value,
          name: t(status.i18n_label),
          icon: <ModuleStatusIcon status={status.value} height="14px" width="14px" />,
        }));
      case "lead":
        return groupKeys.map((key) => {
          if (key === "none") return { id: "none", name: t("common.no_lead") };
          const user = getUserDetails(key);
          return {
            id: key,
            name: user?.display_name ?? key,
          };
        });
      case "members":
        return groupKeys.map((key) => {
          if (key === "none") return { id: "none", name: t("common.no_members") };
          const user = getUserDetails(key);
          return {
            id: key,
            name: user?.display_name ?? key,
          };
        });
      case "label":
        return groupKeys.map((key) => {
          if (key === "none") return { id: "none", name: t("common.no_label") };
          const label = getLabelById(key);
          return {
            id: key,
            name: label?.name ?? key,
          };
        });
      case "start_date":
      case "target_date":
        return groupKeys.sort().map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_date") : key,
        }));
      default:
        return groupKeys.map((key) => ({ id: key, name: key }));
    }
  }, [groupBy, groupedModuleIds, getUserDetails, getLabelById, t]);

  // Items map: moduleId -> module (as IBaseLayoutsKanbanItem-compatible)
  const items = useMemo(() => {
    const map: Record<string, IModule> = {};
    Object.values(groupedModuleIds)
      .flat()
      .forEach((id) => {
        if (moduleMap[id]) map[id] = moduleMap[id];
      });
    return map;
  }, [groupedModuleIds, moduleMap]);

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
      groupClassName="bg-layer-2"
    />
  );
});
