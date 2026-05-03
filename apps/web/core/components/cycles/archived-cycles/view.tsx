/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FC } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
// assets
import AllFiltersImage from "@/app/assets/empty-state/cycle/all-filters.svg?url";
import NameFilterImage from "@/app/assets/empty-state/cycle/name-filter.svg?url";
// components
import { CyclesList } from "@/components/cycles/list";
// ui
import { CycleModuleListLayoutLoader } from "@/components/ui/loader/cycle-module-list-loader";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useCycleFilter } from "@/hooks/store/use-cycle-filter";

export interface IArchivedCyclesView {
  workspaceSlug: string;
  projectId: string;
}

export const ArchivedCyclesView = observer(function ArchivedCyclesView(props: IArchivedCyclesView) {
  const { workspaceSlug, projectId } = props;
  // store hooks
  const { getFilteredArchivedCycleIds, loader } = useCycle();
  const { archivedCyclesSearchQuery } = useCycleFilter();
  const { t } = useTranslation();
  // derived values
  const filteredArchivedCycleIds = getFilteredArchivedCycleIds(projectId);

  if (loader || !filteredArchivedCycleIds) return <CycleModuleListLayoutLoader />;

  if (filteredArchivedCycleIds.length === 0)
    return (
      <div className="h-full w-full grid place-items-center">
        <div className="text-center">
          <img
            src={archivedCyclesSearchQuery.trim() === "" ? AllFiltersImage : NameFilterImage}
            className="h-36 sm:h-48 w-36 sm:w-48 mx-auto"
            alt={t("project_cycles.no_matching_cycles")}
          />
          <h5 className="text-18 font-medium mt-7 mb-1">{t("project_cycles.no_matching_cycles")}</h5>
          <p className="text-placeholder text-14">
            {archivedCyclesSearchQuery.trim() === ""
              ? t("project_cycles.remove_filters_to_see_all_cycles")
              : t("project_cycles.remove_search_criteria_to_see_all_cycles")}
          </p>
        </div>
      </div>
    );

  return (
    <CyclesList
      completedCycleIds={[]}
      cycleIds={filteredArchivedCycleIds}
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      isArchived
    />
  );
});
