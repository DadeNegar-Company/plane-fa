/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import type { TNameDescriptionLoader } from "@plane/types";
import { EFileAssetType } from "@plane/types";
// components
import { DescriptionInput } from "@/components/editor/rich-text/description-input";
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useUserPermissions } from "@/hooks/store/user";

type Props = {
  moduleId: string;
  workspaceSlug: string;
  projectId: string;
};

export const ModuleDescriptionBanner = observer(function ModuleDescriptionBanner(props: Props) {
  const { moduleId, workspaceSlug, projectId } = props;
  // states
  const [isExpanded, setIsExpanded] = useState(false);
  // hooks
  const { t } = useTranslation();
  const { getModuleById, updateModuleDetails } = useModule();
  const { allowPermissions } = useUserPermissions();
  // derived
  const moduleDetails = getModuleById(moduleId);
  const isEditingAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  if (!moduleDetails) return null;

  const hasDescription = moduleDetails.description_html && moduleDetails.description_html !== "<p></p>";

  return (
    <div className="border-b border-subtle bg-surface-1">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-2 text-13 text-secondary hover:bg-layer-1-hover transition-colors"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-medium">{t("description")}</span>
        {!hasDescription && !isExpanded && (
          <span className="text-placeholder text-11">{t("common.click_to_add_description")}</span>
        )}
        <div className="ml-auto">
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-3">
          {/* eslint-disable @typescript-eslint/no-unsafe-assignment */}
          <DescriptionInput
            entityId={moduleId}
            initialValue={moduleDetails.description_html ?? ""}
            fileAssetType={EFileAssetType.MODULE_DESCRIPTION}
            onSubmit={async (value) => {
              await updateModuleDetails(workspaceSlug, projectId, moduleId, { description_html: value });
            }}
            projectId={projectId}
            workspaceSlug={workspaceSlug}
            setIsSubmitting={(_value: TNameDescriptionLoader) => {}}
            disabled={!isEditingAllowed || !!moduleDetails.archived_at}
            containerClassName="min-h-[80px] border border-subtle rounded-md"
          />
          {/* eslint-enable @typescript-eslint/no-unsafe-assignment */}
        </div>
      )}
    </div>
  );
});
