/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { SyntheticEvent } from "react";
import React, { useRef } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Info, SquareUser } from "lucide-react";
// plane package imports
import {
  MODULE_STATUS,
  PROGRESS_STATE_GROUPS_DETAILS,
  EUserPermissions,
  EUserPermissionsLevel,
  IS_FAVORITE_MENU_OPEN,
} from "@plane/constants";
import { useLocalStorage } from "@plane/hooks";
import { WorkItemsIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setPromiseToast, setToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { IModule, TModuleDisplayProperties } from "@plane/types";
import { Card, FavoriteStar, LinearProgressIndicator } from "@plane/ui";
import { getDate, renderFormattedPayloadDate, generateQueryParams } from "@plane/utils";
// components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import { ButtonAvatars } from "@/components/dropdowns/member/avatar";
import { ModuleQuickActions } from "@/components/modules";
import { ModuleStatusDropdown } from "@/components/modules/module-status-dropdown";
// hooks
import { useLabel } from "@/hooks/store/use-label";
import { useMember } from "@/hooks/store/use-member";
import { useModule } from "@/hooks/store/use-module";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";

type Props = {
  moduleId: string;
  displayProperties?: TModuleDisplayProperties;
};

export const ModuleCardItem = observer(function ModuleCardItem(props: Props) {
  const { moduleId, displayProperties = {} } = props;
  const dp = {
    lead: displayProperties.lead ?? true,
    members: displayProperties.members ?? false,
    labels: displayProperties.labels ?? true,
    start_date: displayProperties.start_date ?? true,
    target_date: displayProperties.target_date ?? true,
    progress: displayProperties.progress ?? true,
    issue_count: displayProperties.issue_count ?? true,
  };
  // refs
  const parentRef = useRef(null);
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { getModuleById, addModuleToFavorites, removeModuleFromFavorites, updateModuleDetails } = useModule();
  const { getUserDetails } = useMember();
  const { getLabelById } = useLabel();
  // local storage
  const { setValue: toggleFavoriteMenu, storedValue } = useLocalStorage<boolean>(IS_FAVORITE_MENU_OPEN, false);
  // derived values
  const moduleDetails = getModuleById(moduleId);
  const isEditingAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );
  const isDisabled = !isEditingAllowed || !!moduleDetails?.archived_at;
  const renderIcon = Boolean(moduleDetails?.start_date) || Boolean(moduleDetails?.target_date);

  const { isMobile } = usePlatformOS();
  const handleAddToFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!workspaceSlug || !projectId) return;

    const addToFavoritePromise = addModuleToFavorites(workspaceSlug.toString(), projectId.toString(), moduleId).then(
      () => {
        if (!storedValue) toggleFavoriteMenu(true);
        return undefined;
      }
    );

    setPromiseToast(addToFavoritePromise, {
      loading: "Adding module to favorites...",
      success: {
        title: "Success!",
        message: () => "Module added to favorites.",
      },
      error: {
        title: "Error!",
        message: () => "Couldn't add the module to favorites. Please try again.",
      },
    });
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!workspaceSlug || !projectId) return;

    const removeFromFavoritePromise = removeModuleFromFavorites(
      workspaceSlug.toString(),
      projectId.toString(),
      moduleId
    );

    setPromiseToast(removeFromFavoritePromise, {
      loading: "Removing module from favorites...",
      success: {
        title: "Success!",
        message: () => "Module removed from favorites.",
      },
      error: {
        title: "Error!",
        message: () => "Couldn't remove the module from favorites. Please try again.",
      },
    });
  };

  const handleEventPropagation = (e: SyntheticEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleModuleDetailsChange = async (payload: Partial<IModule>) => {
    if (!workspaceSlug || !projectId) return;

    await updateModuleDetails(workspaceSlug.toString(), projectId.toString(), moduleId, payload)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Module updated successfully.",
        });
        return undefined;
      })
      .catch((err: { detail?: string }) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.detail ?? "Module could not be updated. Please try again.",
        });
      });
  };

  const openModuleOverview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const query = generateQueryParams(searchParams, ["peekModule"]);
    if (searchParams.has("peekModule") && searchParams.get("peekModule") === moduleId) {
      router.push(`${pathname}?${query}`);
    } else {
      router.push(`${pathname}?${query && `${query}&`}peekModule=${moduleId}`);
    }
  };

  if (!moduleDetails) return null;

  const moduleTotalIssues =
    moduleDetails.backlog_issues +
    moduleDetails.unstarted_issues +
    moduleDetails.started_issues +
    moduleDetails.completed_issues +
    moduleDetails.cancelled_issues;

  const moduleCompletedIssues = moduleDetails.completed_issues;

  // const areYearsEqual = startDate.getFullYear() === endDate.getFullYear();

  const moduleStatus = MODULE_STATUS.find((status) => status.value === moduleDetails.status);

  const issueCount = moduleDetails
    ? !moduleTotalIssues || moduleTotalIssues === 0
      ? `0 work items`
      : moduleTotalIssues === moduleCompletedIssues
        ? `${moduleTotalIssues} Work item${moduleTotalIssues > 1 ? `s` : ``}`
        : `${moduleCompletedIssues}/${moduleTotalIssues} Work items`
    : `0 work items`;

  const moduleLeadDetails = moduleDetails.lead_id ? getUserDetails(moduleDetails.lead_id) : undefined;

  const progressIndicatorData = PROGRESS_STATE_GROUPS_DETAILS.map((group, index) => ({
    id: index,
    name: group.title,
    value: moduleTotalIssues > 0 ? (moduleDetails[group.key as keyof IModule] as number) : 0,
    color: group.color,
  }));

  return (
    <div className="relative h-full" data-prevent-progress>
      <Link
        ref={parentRef}
        draggable={false}
        href={`/${workspaceSlug}/projects/${moduleDetails.project_id}/modules/${moduleDetails.id}`}
        className="h-full"
      >
        <Card className="!p-3 !border !border-subtle !shadow-raised-100 !bg-layer-2 hover:!border-strong h-full flex flex-col">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Tooltip tooltipContent={moduleDetails.name} position="top" isMobile={isMobile}>
                <span className="truncate text-14 font-medium">{moduleDetails.name}</span>
              </Tooltip>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className="flex items-center gap-2" onClick={handleEventPropagation}>
                {moduleStatus && (
                  <ModuleStatusDropdown
                    isDisabled={isDisabled}
                    moduleDetails={moduleDetails}
                    handleModuleDetailsChange={handleModuleDetailsChange}
                  />
                )}
                <button onClick={openModuleOverview}>
                  <Info className="h-4 w-4 text-placeholder" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {(dp.issue_count || dp.lead) && (
              <div className="flex items-center justify-between">
                {dp.issue_count && (
                  <div className="flex items-center gap-1.5 text-secondary">
                    <WorkItemsIcon className="h-4 w-4 text-tertiary" />
                    <span className="text-11 text-tertiary">{issueCount ?? "0 Work item"}</span>
                  </div>
                )}
                {dp.lead &&
                  (moduleLeadDetails ? (
                    <span className="cursor-default ml-auto">
                      <ButtonAvatars showTooltip={false} userIds={moduleLeadDetails?.id} />
                    </span>
                  ) : (
                    <Tooltip tooltipContent="No lead">
                      <SquareUser className="h-4 w-4 mx-1 text-tertiary ml-auto" />
                    </Tooltip>
                  ))}
              </div>
            )}
            {dp.labels && moduleDetails.label_ids && moduleDetails.label_ids.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {moduleDetails.label_ids.slice(0, 3).map((labelId) => {
                  const label = getLabelById(labelId);
                  if (!label) return null;
                  return (
                    <div
                      key={labelId}
                      className="flex items-center gap-1 rounded-sm bg-layer-1 px-1.5 py-0.5 text-11 text-tertiary"
                    >
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                      <span className="truncate max-w-[80px]">{label.name}</span>
                    </div>
                  );
                })}
                {moduleDetails.label_ids.length > 3 && (
                  <span className="text-11 text-tertiary">+{moduleDetails.label_ids.length - 3}</span>
                )}
              </div>
            )}
            {dp.progress && <LinearProgressIndicator size="lg" data={progressIndicatorData} />}
            {(dp.start_date || dp.target_date) && (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div className="flex items-center justify-between py-0.5 mt-auto" onClick={handleEventPropagation}>
                <DateRangeDropdown
                  buttonContainerClassName={`h-6 w-full flex ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} items-center gap-1.5 text-tertiary border-[0.5px] border-strong rounded-sm text-11`}
                  buttonVariant="transparent-with-text"
                  className="h-7"
                  value={{
                    from: dp.start_date ? getDate(moduleDetails.start_date) : undefined,
                    to: dp.target_date ? getDate(moduleDetails.target_date) : undefined,
                  }}
                  onSelect={(val) => {
                    void handleModuleDetailsChange({
                      start_date: val?.from ? renderFormattedPayloadDate(val.from) : null,
                      target_date: val?.to ? renderFormattedPayloadDate(val.to) : null,
                    });
                  }}
                  placeholder={{
                    from: "Start date",
                    to: "End date",
                  }}
                  disabled={isDisabled}
                  hideIcon={{ from: renderIcon ?? true, to: renderIcon }}
                />
              </div>
            )}
          </div>
        </Card>
      </Link>
      <div className="absolute right-4 bottom-[18px] flex items-center gap-1.5">
        {isEditingAllowed && (
          <FavoriteStar
            onClick={(e) => {
              if (moduleDetails.is_favorite) handleRemoveFromFavorites(e);
              else handleAddToFavorites(e);
            }}
            selected={!!moduleDetails.is_favorite}
          />
        )}
        {workspaceSlug && projectId && (
          <ModuleQuickActions
            parentRef={parentRef}
            moduleId={moduleId}
            projectId={projectId.toString()}
            workspaceSlug={workspaceSlug.toString()}
          />
        )}
      </div>
    </div>
  );
});
