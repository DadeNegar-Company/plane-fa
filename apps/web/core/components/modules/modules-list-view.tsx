/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import { observer } from "mobx-react";
import { useParams, useSearchParams } from "next/navigation";
// components
import { EUserPermissionsLevel, MODULE_STATUS, MODULE_TRACKER_ELEMENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { ModuleStatusIcon } from "@plane/propel/icons";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import type { IModule, IBaseLayoutsBaseGroup, TModuleDisplayProperties } from "@plane/types";
import { EUserProjectRoles } from "@plane/types";
import { ContentWrapper, Row, ERowVariant } from "@plane/ui";
// components
import { BaseListLayout } from "@/components/base-layouts/list/layout";
import { ListLayout } from "@/components/core/list";
import {
  ModuleCardItem,
  ModuleKanbanRoot,
  ModuleListItem,
  ModulePeekOverview,
  ModulesListGanttChartView,
} from "@/components/modules";
import { CycleModuleBoardLayoutLoader } from "@/components/ui/loader/cycle-module-board-loader";
import { CycleModuleListLayoutLoader } from "@/components/ui/loader/cycle-module-list-loader";
import { GanttLayoutLoader } from "@/components/ui/loader/layouts/gantt-layout-loader";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useLabel } from "@/hooks/store/use-label";
import { useMember } from "@/hooks/store/use-member";
import { useModule } from "@/hooks/store/use-module";
import { useModuleFilter } from "@/hooks/store/use-module-filter";
import { useUserPermissions } from "@/hooks/store/user";

export const ModulesListView = observer(function ModulesListView() {
  // router
  const { workspaceSlug, projectId } = useParams();
  const searchParams = useSearchParams();
  const peekModule = searchParams.get("peekModule");
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { toggleCreateModuleModal } = useCommandPalette();
  const { getProjectModuleIds, getFilteredModuleIds, getGroupedModuleIds, getSubGroupedModuleIds, moduleMap, loader } =
    useModule();
  const { currentProjectDisplayFilters: displayFilters } = useModuleFilter();
  const { allowPermissions } = useUserPermissions();
  const { getUserDetails } = useMember();
  const { getLabelById } = useLabel();
  // derived values
  const projectModuleIds = projectId ? getProjectModuleIds(projectId.toString()) : undefined;
  const filteredModuleIds = projectId ? getFilteredModuleIds(projectId.toString()) : undefined;
  const groupedModuleIds = projectId ? getGroupedModuleIds(projectId.toString()) : null;
  const subGroupedModuleIds = projectId ? getSubGroupedModuleIds(projectId.toString()) : null;
  const displayProperties: TModuleDisplayProperties = displayFilters?.display_properties ?? {};

  // Build groups for BaseListLayout/BaseKanbanLayout
  const groups: IBaseLayoutsBaseGroup[] = useMemo(() => {
    const groupBy = displayFilters?.group_by;
    if (!groupBy || !groupedModuleIds) return [];
    const groupKeys = Object.keys(groupedModuleIds);
    switch (groupBy) {
      case "status":
        return MODULE_STATUS.map((status) => ({
          id: status.value,
          name: t(status.i18n_label),
          icon: <ModuleStatusIcon status={status.value} height="14px" width="14px" />,
        }));
      case "lead":
        return groupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_lead") : (getUserDetails(key)?.display_name ?? key),
        }));
      case "members":
        return groupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_members") : (getUserDetails(key)?.display_name ?? key),
        }));
      case "label":
        return groupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_label") : (getLabelById(key)?.name ?? key),
        }));
      case "start_date":
      case "target_date":
        return groupKeys.sort().map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_date") : key,
        }));
      default:
        return groupKeys.map((key) => ({ id: key, name: key }));
    }
  }, [displayFilters?.group_by, groupedModuleIds, getUserDetails, getLabelById, t]);

  // Build sub-groups array (for kanban sub-group mode)
  const subGroups: IBaseLayoutsBaseGroup[] = useMemo(() => {
    const subGroupBy = displayFilters?.sub_group_by;
    if (!subGroupBy || !subGroupedModuleIds) return [];
    const allSubGroupKeys = new Set<string>();
    Object.values(subGroupedModuleIds).forEach((inner) => Object.keys(inner).forEach((k) => allSubGroupKeys.add(k)));
    const subGroupKeys = Array.from(allSubGroupKeys);
    switch (subGroupBy) {
      case "status":
        return MODULE_STATUS.map((status) => ({
          id: status.value,
          name: t(status.i18n_label),
          icon: <ModuleStatusIcon status={status.value} height="14px" width="14px" />,
        }));
      case "lead":
        return subGroupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_lead") : (getUserDetails(key)?.display_name ?? key),
        }));
      case "members":
        return subGroupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_members") : (getUserDetails(key)?.display_name ?? key),
        }));
      case "label":
        return subGroupKeys.map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_label") : (getLabelById(key)?.name ?? key),
        }));
      case "start_date":
      case "target_date":
        return subGroupKeys.sort().map((key) => ({
          id: key,
          name: key === "none" ? t("common.no_date") : key,
        }));
      default:
        return subGroupKeys.map((key) => ({ id: key, name: key }));
    }
  }, [displayFilters?.sub_group_by, subGroupedModuleIds, getUserDetails, getLabelById, t]);

  // Items map for BaseListLayout/BaseKanbanLayout
  const items = useMemo(() => {
    if (!groupedModuleIds) return {};
    const map: Record<string, IModule> = {};
    Object.values(groupedModuleIds)
      .flat()
      .forEach((id) => {
        if (moduleMap[id]) map[id] = moduleMap[id];
      });
    return map;
  }, [groupedModuleIds, moduleMap]);
  const canPerformEmptyStateActions = allowPermissions(
    [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  if (loader || !projectModuleIds || !filteredModuleIds)
    return (
      <>
        {displayFilters?.layout === "list" && <CycleModuleListLayoutLoader />}
        {displayFilters?.layout === "board" && <CycleModuleBoardLayoutLoader />}
        {displayFilters?.layout === "kanban" && <CycleModuleBoardLayoutLoader />}
        {displayFilters?.layout === "gantt" && <GanttLayoutLoader />}
      </>
    );

  if (projectModuleIds.length === 0)
    return (
      <EmptyStateDetailed
        assetKey="module"
        title={t("project_empty_state.modules.title")}
        description={t("project_empty_state.modules.description")}
        actions={[
          {
            label: t("project_empty_state.modules.cta_primary"),
            onClick: () => toggleCreateModuleModal(true),
            disabled: !canPerformEmptyStateActions,
            variant: "primary",
            "data-ph-element": MODULE_TRACKER_ELEMENTS.EMPTY_STATE_ADD_BUTTON,
          },
        ]}
      />
    );

  if (filteredModuleIds.length === 0)
    return (
      <EmptyStateDetailed
        assetKey="search"
        title={t("common_empty_state.search.title")}
        description={t("common_empty_state.search.description")}
      />
    );

  return (
    <ContentWrapper variant={ERowVariant.HUGGING}>
      <div className="size-full flex justify-between">
        {}
        {displayFilters?.layout === "list" &&
          (displayFilters?.group_by && groupedModuleIds ? (
            <BaseListLayout
              items={items}
              groups={groups}
              groupedItemIds={groupedModuleIds}
              renderItem={(item) => <ModuleListItem moduleId={item.id} displayProperties={displayProperties} />}
              showEmptyGroups={displayFilters.show_empty_groups ?? true}
            />
          ) : (
            <ListLayout>
              {filteredModuleIds.map((moduleId) => (
                <ModuleListItem key={moduleId} moduleId={moduleId} displayProperties={displayProperties} />
              ))}
            </ListLayout>
          ))}
        {}
        {displayFilters?.layout === "board" && (
          <Row
            className={`size-full py-page-y grid grid-cols-1 gap-6 overflow-y-auto ${
              peekModule
                ? "lg:grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3"
                : "lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4"
            } auto-rows-max transition-all vertical-scrollbar scrollbar-lg`}
          >
            {filteredModuleIds.map((moduleId) => (
              <ModuleCardItem key={moduleId} moduleId={moduleId} displayProperties={displayProperties} />
            ))}
          </Row>
        )}
        {displayFilters?.layout === "kanban" && groupedModuleIds && (
          <div className="size-full overflow-hidden">
            {}
            <ModuleKanbanRoot
              groupedModuleIds={groupedModuleIds}
              groupBy={displayFilters?.group_by ?? "status"}
              groups={groups}
              items={items}
              showEmptyGroups={displayFilters?.show_empty_groups ?? true}
              subGroupedModuleIds={subGroupedModuleIds ?? undefined}
              subGroupBy={displayFilters?.sub_group_by ?? undefined}
              subGroups={subGroups.length > 0 ? subGroups : undefined}
            />
            {}
          </div>
        )}
        {displayFilters?.layout === "gantt" && (
          <div className="size-full overflow-hidden">
            <ModulesListGanttChartView />
          </div>
        )}
        <div className="flex-shrink-0">
          <ModulePeekOverview projectId={projectId?.toString() ?? ""} workspaceSlug={workspaceSlug?.toString() ?? ""} />
        </div>
      </div>
    </ContentWrapper>
  );
});
