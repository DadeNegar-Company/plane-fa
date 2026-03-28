/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { useState } from "react";
import { observer } from "mobx-react";
import { MODULE_GROUP_BY_OPTIONS, MODULE_ORDER_BY_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import type { TModuleDisplayFilters, TModuleGroupByOptions, TModuleOrderByOptions } from "@plane/types";
// Reuse the exact same UI components that issue DisplayFiltersSelection uses
import { FilterHeader, FilterOption } from "@/components/issues/issue-layouts/filters";

type Props = {
  displayFilters: TModuleDisplayFilters;
  handleDisplayFiltersUpdate: (filters: Partial<TModuleDisplayFilters>) => void;
};

export const ModuleDisplayFiltersSelection = observer(function ModuleDisplayFiltersSelection(props: Props) {
  const { displayFilters, handleDisplayFiltersUpdate } = props;
  const { t } = useTranslation();

  const [groupByPreview, setGroupByPreview] = useState(true);
  const [orderByPreview, setOrderByPreview] = useState(true);

  const selectedGroupBy = displayFilters.group_by ?? null;
  const selectedOrderBy = displayFilters.order_by ?? "name";

  return (
    <div className="vertical-scrollbar scrollbar-sm relative h-full w-full divide-y divide-subtle-1 overflow-hidden overflow-y-auto px-2.5">
      {/* Group By — same pattern as FilterGroupBy in issues */}
      <div className="py-2">
        <FilterHeader
          title={t("common.group_by")}
          isPreviewEnabled={groupByPreview}
          handleIsPreviewEnabled={() => setGroupByPreview(!groupByPreview)}
        />
        {groupByPreview && (
          <div>
            <FilterOption
              isChecked={selectedGroupBy === null}
              onClick={() => handleDisplayFiltersUpdate({ group_by: null })}
              title={t("project_modules.group_by.none")}
              multiple={false}
            />
            {MODULE_GROUP_BY_OPTIONS.map((option) => (
              <FilterOption
                key={option.key as string}
                isChecked={selectedGroupBy === option.key}
                onClick={() => handleDisplayFiltersUpdate({ group_by: option.key as TModuleGroupByOptions })}
                title={t(option.i18n_label)}
                multiple={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order By — same pattern as FilterOrderBy in issues */}
      <div className="py-2">
        <FilterHeader
          title={t("common.order_by.label")}
          isPreviewEnabled={orderByPreview}
          handleIsPreviewEnabled={() => setOrderByPreview(!orderByPreview)}
        />
        {orderByPreview && (
          <div>
            {MODULE_ORDER_BY_OPTIONS.map((option) => (
              <FilterOption
                key={option.key as string}
                isChecked={selectedOrderBy?.replace("-", "") === option.key}
                onClick={() => {
                  const isDescending = selectedOrderBy?.[0] === "-";
                  handleDisplayFiltersUpdate({
                    order_by: (isDescending ? `-${option.key}` : option.key) as TModuleOrderByOptions,
                  });
                }}
                title={t(option.i18n_label)}
                multiple={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Extra Options — same pattern as FilterExtraOptions in issues */}
      <div className="py-2">
        <FilterOption
          isChecked={displayFilters.favorites ?? false}
          onClick={() => handleDisplayFiltersUpdate({ favorites: !displayFilters.favorites })}
          title={t("project_modules.display.show_favorites_only")}
        />
      </div>
    </div>
  );
});
