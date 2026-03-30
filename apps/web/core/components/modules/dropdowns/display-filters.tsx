/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { MODULE_DISPLAY_PROPERTIES, MODULE_GROUP_BY_OPTIONS, MODULE_ORDER_BY_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import type { TModuleDisplayFilters, TModuleDisplayPropertyKey, TModuleOrderByOptions } from "@plane/types";
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
  const [subGroupByPreview, setSubGroupByPreview] = useState(true);
  const [orderByPreview, setOrderByPreview] = useState(true);
  const [displayPropsPreview, setDisplayPropsPreview] = useState(true);

  const selectedGroupBy = displayFilters.group_by ?? null;
  const selectedSubGroupBy = displayFilters.sub_group_by ?? null;
  const selectedOrderBy = displayFilters.order_by ?? "name";
  const displayProperties = displayFilters.display_properties ?? {};
  const isKanban = displayFilters.layout === "kanban";

  const handleDisplayPropertyToggle = (key: TModuleDisplayPropertyKey) => {
    handleDisplayFiltersUpdate({
      display_properties: { ...displayProperties, [key]: !displayProperties[key] },
    });
  };

  return (
    <div className="vertical-scrollbar scrollbar-sm relative h-full w-full divide-y divide-subtle-1 overflow-hidden overflow-y-auto px-2.5">
      {/* Group By */}
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
              onClick={() => handleDisplayFiltersUpdate({ group_by: null, sub_group_by: null })}
              title={t("project_modules.group_by.none")}
              multiple={false}
            />
            {MODULE_GROUP_BY_OPTIONS.map((option) => (
              <FilterOption
                key={option.key as string}
                isChecked={selectedGroupBy === option.key}
                onClick={() => {
                  const isSameAsSubGroup = selectedSubGroupBy === option.key;
                  handleDisplayFiltersUpdate({
                    group_by: option.key,
                    // clear sub_group_by if it matches the new group_by
                    ...(isSameAsSubGroup ? { sub_group_by: null } : {}),
                  });
                }}
                title={t(option.i18n_label)}
                multiple={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sub-group By — only for kanban layout */}
      {isKanban && selectedGroupBy && (
        <div className="py-2">
          <FilterHeader
            title={t("sub_group_by")}
            isPreviewEnabled={subGroupByPreview}
            handleIsPreviewEnabled={() => setSubGroupByPreview(!subGroupByPreview)}
          />
          {subGroupByPreview && (
            <div>
              <FilterOption
                isChecked={selectedSubGroupBy === null}
                onClick={() => handleDisplayFiltersUpdate({ sub_group_by: null })}
                title={t("common.none")}
                multiple={false}
              />
              {MODULE_GROUP_BY_OPTIONS.filter((opt) => opt.key !== selectedGroupBy).map((option) => (
                <FilterOption
                  key={option.key as string}
                  isChecked={selectedSubGroupBy === option.key}
                  onClick={() => handleDisplayFiltersUpdate({ sub_group_by: option.key })}
                  title={t(option.i18n_label)}
                  multiple={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order By */}
      <div className="py-2">
        <FilterHeader
          title={t("common.order_by.label")}
          isPreviewEnabled={orderByPreview}
          handleIsPreviewEnabled={() => setOrderByPreview(!orderByPreview)}
        />
        {orderByPreview && (
          <div>
            {MODULE_ORDER_BY_OPTIONS.map((option) => {
              const currentBase = selectedOrderBy?.replace("-", "");
              const isSelected = currentBase === option.key;
              const isDescending = isSelected && selectedOrderBy?.[0] === "-";
              return (
                <FilterOption
                  key={option.key as string}
                  isChecked={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      // toggle direction
                      handleDisplayFiltersUpdate({
                        order_by: (isDescending ? option.key : `-${option.key}`) as TModuleOrderByOptions,
                      });
                    } else {
                      handleDisplayFiltersUpdate({ order_by: option.key });
                    }
                  }}
                  title={`${t(option.i18n_label)}${isSelected ? (isDescending ? " ↓" : " ↑") : ""}`}
                  multiple={false}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Display Properties */}
      <div className="py-2">
        <FilterHeader
          title={t("common.display_properties")}
          isPreviewEnabled={displayPropsPreview}
          handleIsPreviewEnabled={() => setDisplayPropsPreview(!displayPropsPreview)}
        />
        {displayPropsPreview && (
          <div>
            {MODULE_DISPLAY_PROPERTIES.map((property) => (
              <FilterOption
                key={property.key}
                isChecked={displayProperties[property.key] ?? false}
                onClick={() => handleDisplayPropertyToggle(property.key)}
                title={t(property.i18n_label)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Extra Options */}
      <div className="py-2">
        <FilterOption
          isChecked={displayFilters.show_empty_groups ?? true}
          onClick={() => handleDisplayFiltersUpdate({ show_empty_groups: !(displayFilters.show_empty_groups ?? true) })}
          title={t("issue.display.extra.show_empty_groups")}
        />
        <FilterOption
          isChecked={displayFilters.favorites ?? false}
          onClick={() => handleDisplayFiltersUpdate({ favorites: !displayFilters.favorites })}
          title={t("project_modules.display.show_favorites_only")}
        />
      </div>
    </div>
  );
});
