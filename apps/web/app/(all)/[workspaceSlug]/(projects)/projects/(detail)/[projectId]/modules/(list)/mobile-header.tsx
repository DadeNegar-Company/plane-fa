/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { MODULE_VIEW_LAYOUTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { ChevronDownIcon } from "@plane/propel/icons";
import type { TModuleDisplayFilters } from "@plane/types";
import { CustomMenu, Row } from "@plane/ui";
import { ModuleLayoutIcon } from "@/components/modules";
import { useModuleFilter } from "@/hooks/store/use-module-filter";
import { useProject } from "@/hooks/store/use-project";

export const ModulesListMobileHeader = observer(function ModulesListMobileHeader() {
  const { currentProjectDetails } = useProject();
  const { currentProjectDisplayFilters: displayFilters, updateDisplayFilters } = useModuleFilter();
  const { t } = useTranslation();

  return (
    <div className="flex justify-start md:hidden">
      <CustomMenu
        maxHeight={"md"}
        className="flex flex-grow justify-start text-secondary text-13 py-2 border-b border-subtle bg-surface-1"
        // placement="bottom-start"
        customButton={
          <Row className="flex flex-grow justify-center text-secondary text-13 gap-2">
            <span>Layout</span> <ChevronDownIcon className="h-4 w-4 text-secondary my-auto" strokeWidth={1} />
          </Row>
        }
        customButtonClassName="flex flex-grow justify-center items-center text-secondary text-13"
        closeOnSelect
      >
        {MODULE_VIEW_LAYOUTS.map((layout) => {
          if (layout.key === "gantt") return null;
          return (
            <CustomMenu.MenuItem
              key={layout.key}
              onClick={() => {
                const updates: TModuleDisplayFilters = { layout: layout.key };
                if (layout.key === "kanban" && !displayFilters?.group_by) {
                  updates.group_by = "status";
                }
                if (!currentProjectDetails?.id) return;
                updateDisplayFilters(currentProjectDetails.id.toString(), updates);
              }}
              className="flex items-center gap-2"
            >
              <ModuleLayoutIcon layoutType={layout.key} />
              <div className="text-tertiary">{t(layout.i18n_title)}</div>
            </CustomMenu.MenuItem>
          );
        })}
      </CustomMenu>
    </div>
  );
});
