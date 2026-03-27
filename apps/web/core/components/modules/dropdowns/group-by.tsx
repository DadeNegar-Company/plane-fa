/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Columns3 } from "lucide-react";
import { MODULE_GROUP_BY_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import { CheckIcon, ChevronDownIcon } from "@plane/propel/icons";
import type { TModuleGroupByOptions } from "@plane/types";
// ui
import { CustomMenu } from "@plane/ui";
// helpers
import { cn } from "@plane/utils";

type Props = {
  onChange: (value: TModuleGroupByOptions) => void;
  value: TModuleGroupByOptions | undefined;
};

export function ModuleGroupByDropdown(props: Props) {
  const { onChange, value } = props;
  // hooks
  const { t } = useTranslation();

  const groupByDetails = MODULE_GROUP_BY_OPTIONS.find((option) => option.key === value);

  return (
    <CustomMenu
      customButton={
        <div className={cn(getButtonStyling("secondary", "lg"), "px-2 text-tertiary")}>
          <Columns3 className="size-3" />
          {groupByDetails ? t(groupByDetails.i18n_label) : t("project_modules.group_by.none")}
          <ChevronDownIcon className="size-3" strokeWidth={2} />
        </div>
      }
      placement="bottom-end"
      maxHeight="lg"
      closeOnSelect
    >
      <CustomMenu.MenuItem className="flex items-center justify-between gap-2" onClick={() => onChange(null)}>
        {t("project_modules.group_by.none")}
        {!value && <CheckIcon className="h-3 w-3" />}
      </CustomMenu.MenuItem>
      <hr className="my-2 border-subtle" />
      {MODULE_GROUP_BY_OPTIONS.map((option) => (
        <CustomMenu.MenuItem
          key={option.key}
          className="flex items-center justify-between gap-2"
          onClick={() => onChange(option.key)}
        >
          {t(option.i18n_label)}
          {value === option.key && <CheckIcon className="h-3 w-3" />}
        </CustomMenu.MenuItem>
      ))}
    </CustomMenu>
  );
}
