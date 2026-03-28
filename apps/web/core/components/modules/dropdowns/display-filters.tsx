/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { observer } from "mobx-react";
import { MODULE_GROUP_BY_OPTIONS, MODULE_ORDER_BY_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { CheckIcon } from "@plane/propel/icons";
import type { TModuleDisplayFilters, TModuleOrderByOptions } from "@plane/types";
import { cn } from "@plane/utils";

type Props = {
  displayFilters: TModuleDisplayFilters;
  handleDisplayFiltersUpdate: (filters: Partial<TModuleDisplayFilters>) => void;
};

export const ModuleDisplayFiltersSelection = observer(function ModuleDisplayFiltersSelection(props: Props) {
  const { displayFilters, handleDisplayFiltersUpdate } = props;
  const { t } = useTranslation();

  const groupBy = displayFilters.group_by ?? null;
  const orderBy = displayFilters.order_by;

  return (
    <div className="vertical-scrollbar scrollbar-sm relative h-full w-full divide-y divide-subtle-1 overflow-hidden overflow-y-auto px-2.5">
      {/* Group By */}
      <div className="py-2">
        <div className="flex items-center justify-between gap-2 text-13 font-medium text-secondary">
          {t("project_modules.display.group_by")}
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <button
            className={cn(
              "flex items-center justify-between rounded-sm px-1 py-1.5 text-13 hover:bg-layer-1-hover transition-colors",
              { "text-accent-primary": !groupBy }
            )}
            onClick={() => handleDisplayFiltersUpdate({ group_by: null })}
          >
            {t("project_modules.group_by.none")}
            {!groupBy && <CheckIcon className="h-3 w-3 text-accent-primary" />}
          </button>
          {MODULE_GROUP_BY_OPTIONS.map((option: { key: string; i18n_label: string }) => (
            <button
              key={option.key}
              className={cn(
                "flex items-center justify-between rounded-sm px-1 py-1.5 text-13 hover:bg-layer-1-hover transition-colors",
                { "text-accent-primary": groupBy === option.key }
              )}
              onClick={() => handleDisplayFiltersUpdate({ group_by: option.key as TModuleDisplayFilters["group_by"] })}
            >
              {t(option.i18n_label)}
              {groupBy === option.key && <CheckIcon className="h-3 w-3 text-accent-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Order By */}
      <div className="py-2">
        <div className="flex items-center justify-between gap-2 text-13 font-medium text-secondary">
          {t("project_modules.display.order_by")}
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          {MODULE_ORDER_BY_OPTIONS.map((option: { key: string; i18n_label: string }) => {
            const isSelected = orderBy?.replace("-", "") === option.key;
            return (
              <button
                key={option.key}
                className={cn(
                  "flex items-center justify-between rounded-sm px-1 py-1.5 text-13 hover:bg-layer-1-hover transition-colors",
                  { "text-accent-primary": isSelected }
                )}
                onClick={() => {
                  const isDescending = orderBy?.[0] === "-";
                  handleDisplayFiltersUpdate({
                    order_by: isDescending ? (`-${option.key}` as TModuleOrderByOptions) : option.key,
                  });
                }}
              >
                {t(option.i18n_label)}
                {isSelected && <CheckIcon className="h-3 w-3 text-accent-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra Options */}
      <div className="py-2">
        <button
          className="flex w-full items-center justify-between rounded-sm px-1 py-1.5 text-13 hover:bg-layer-1-hover transition-colors"
          onClick={() => handleDisplayFiltersUpdate({ favorites: !displayFilters.favorites })}
        >
          {t("project_modules.display.show_favorites_only")}
          <div
            className={cn(
              "flex h-4 w-6 flex-shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-all",
              displayFilters.favorites ? "bg-accent-primary" : "bg-neutral-200"
            )}
          >
            <div
              className={cn(
                "h-3 w-3 rounded-full bg-white shadow-raised-100 transition-transform",
                displayFilters.favorites ? "translate-x-2" : "translate-x-0"
              )}
            />
          </div>
        </button>
      </div>
    </div>
  );
});
