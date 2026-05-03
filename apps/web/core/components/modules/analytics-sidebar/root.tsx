/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { Disclosure, Transition } from "@headlessui/react";
import { MODULE_STATUS, EUserPermissions, EUserPermissionsLevel, EEstimateSystem } from "@plane/constants";
// plane types
import { useTranslation } from "@plane/i18n";
import {
  PlusIcon,
  MembersPropertyIcon,
  ModuleStatusIcon,
  WorkItemsIcon,
  StartDatePropertyIcon,
  LabelPropertyIcon,
  UserCirclePropertyIcon,
  EstimatePropertyIcon,
  ChevronDownIcon,
} from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { ILinkDetails, IModule, ModuleLink, TNameDescriptionLoader } from "@plane/types";
import { EFileAssetType } from "@plane/types";
// plane ui
import { Loader, CustomSelect } from "@plane/ui";
// shared sidebar component
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
// components
import { DescriptionInput } from "@/components/editor/rich-text/description-input";
// helpers
import { getDate, renderFormattedPayloadDate } from "@plane/utils";
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { LabelDropdown } from "@/components/issues/issue-layouts/properties/label-dropdown";
import { CreateUpdateModuleLinkModal, ModuleAnalyticsProgress, ModuleLinksList } from "@/components/modules";
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useModule } from "@/hooks/store/use-module";
import { useUserPermissions } from "@/hooks/store/user";

const defaultValues: Partial<IModule> = {
  lead_id: "",
  member_ids: [],
  label_ids: [],
  start_date: null,
  target_date: null,
  status: "backlog",
};

type Props = {
  moduleId: string;
  isArchived?: boolean;
};

export const ModuleAnalyticsSidebar = observer(function ModuleAnalyticsSidebar(props: Props) {
  const { moduleId, isArchived } = props;
  // states
  const [moduleLinkModal, setModuleLinkModal] = useState(false);
  const [selectedLinkToUpdate, setSelectedLinkToUpdate] = useState<ILinkDetails | null>(null);
  // router
  const { workspaceSlug, projectId } = useParams();

  // store hooks
  const { t } = useTranslation();
  const { allowPermissions } = useUserPermissions();

  const { getModuleById, updateModuleDetails, createModuleLink, updateModuleLink, deleteModuleLink } = useModule();
  const { areEstimateEnabledByProjectId, currentActiveEstimateId, estimateById } = useProjectEstimates();

  // derived values
  const moduleDetails = getModuleById(moduleId);
  const areEstimateEnabled = projectId && areEstimateEnabledByProjectId(projectId.toString());
  const estimateType = areEstimateEnabled && currentActiveEstimateId && estimateById(currentActiveEstimateId);
  const isEstimatePointValid = estimateType && String(estimateType?.type) === String(EEstimateSystem.POINTS);

  const { reset, control } = useForm({
    defaultValues,
  });

  const submitChanges = async (data: Partial<IModule>) => {
    if (!workspaceSlug || !projectId || !moduleId) return;
    await updateModuleDetails(workspaceSlug.toString(), projectId.toString(), moduleId.toString(), data);
  };

  const handleCreateLink = async (formData: ModuleLink) => {
    if (!workspaceSlug || !projectId || !moduleId) return;
    const payload = { metadata: {}, ...formData };
    await createModuleLink(workspaceSlug.toString(), projectId.toString(), moduleId.toString(), payload);
  };

  const handleUpdateLink = async (formData: ModuleLink, linkId: string) => {
    if (!workspaceSlug || !projectId) return;
    const payload = { metadata: {}, ...formData };
    await updateModuleLink(workspaceSlug.toString(), projectId.toString(), moduleId.toString(), linkId, payload);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!workspaceSlug || !projectId) return;
    try {
      await deleteModuleLink(workspaceSlug.toString(), projectId.toString(), moduleId.toString(), linkId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("common.success"),
        message: t("project_modules.toasts.link_deleted.message"),
      });
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("common.errors.default.message"),
      });
    }
  };

  const handleDateChange = (startDate: Date | undefined, targetDate: Date | undefined) => {
    void submitChanges({
      start_date: startDate ? renderFormattedPayloadDate(startDate) : null,
      target_date: targetDate ? renderFormattedPayloadDate(targetDate) : null,
    });
    setToast({
      type: TOAST_TYPE.SUCCESS,
      title: t("common.success"),
      message: t("project_modules.toasts.update.success.message"),
    });
  };

  useEffect(() => {
    if (moduleDetails)
      reset({
        ...moduleDetails,
      });
  }, [moduleDetails, reset]);

  const handleEditLink = (link: ILinkDetails) => {
    setSelectedLinkToUpdate(link);
    setModuleLinkModal(true);
  };

  if (!moduleDetails)
    return (
      <Loader>
        <div className="space-y-2">
          <Loader.Item height="15px" width="50%" />
          <Loader.Item height="15px" width="30%" />
        </div>
        <div className="mt-8 space-y-3">
          <Loader.Item height="30px" />
          <Loader.Item height="30px" />
          <Loader.Item height="30px" />
        </div>
      </Loader>
    );

  const moduleStatus = MODULE_STATUS.find((status) => status.value === moduleDetails.status);

  const issueCount =
    moduleDetails.total_issues === 0
      ? t("project_modules.zero_issues")
      : `${moduleDetails.completed_issues}/${moduleDetails.total_issues}`;

  const issueEstimatePointCount =
    moduleDetails.total_estimate_points === 0
      ? t("project_modules.zero_issues")
      : `${moduleDetails.completed_estimate_points}/${moduleDetails.total_estimate_points}`;

  const isEditingAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  const descriptionHtml: string = moduleDetails.description_html ?? "";

  return (
    <div className="relative flex h-full w-full flex-col divide-y-2 divide-subtle-1 overflow-hidden">
      <CreateUpdateModuleLinkModal
        isOpen={moduleLinkModal}
        handleClose={() => {
          setModuleLinkModal(false);
          setTimeout(() => {
            setSelectedLinkToUpdate(null);
          }, 500);
        }}
        data={selectedLinkToUpdate}
        createLink={handleCreateLink}
        updateLink={handleUpdateLink}
      />

      <div className="h-full w-full overflow-y-auto px-6">
        {/* Status + Name */}
        <div className="flex flex-col gap-3 pb-3">
          <div className="flex items-center gap-5 pt-2">
            <Controller
              control={control}
              name="status"
              render={({ field: { value } }) => (
                <CustomSelect
                  customButton={
                    <span
                      className={`flex h-6 w-20 items-center justify-center rounded-xs text-center text-11 ${
                        isEditingAllowed && !isArchived ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      style={{
                        color: moduleStatus ? moduleStatus.color : "#a3a3a2",
                        backgroundColor: moduleStatus ? `${moduleStatus.color}20` : "#a3a3a220",
                      }}
                    >
                      {(moduleStatus && t(moduleStatus?.i18n_label)) ?? t("project_modules.status.backlog")}
                    </span>
                  }
                  value={value}
                  onChange={(value: string) => {
                    void submitChanges({ status: value });
                  }}
                  disabled={!isEditingAllowed || isArchived}
                >
                  {MODULE_STATUS.map((status) => (
                    <CustomSelect.Option key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <ModuleStatusIcon status={status.value} />
                        {t(status.i18n_label)}
                      </div>
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              )}
            />
          </div>
          <h4 className="w-full break-words text-18 font-semibold text-primary">{moduleDetails.name}</h4>
        </div>

        <DescriptionInput
          entityId={moduleId}
          initialValue={descriptionHtml}
          fileAssetType={EFileAssetType.MODULE_DESCRIPTION}
          onSubmit={async (value) => {
            await submitChanges({ description_html: value });
          }}
          projectId={projectId?.toString()}
          workspaceSlug={workspaceSlug?.toString() ?? ""}
          setIsSubmitting={(_value: TNameDescriptionLoader) => {}}
          disabled={!isEditingAllowed || isArchived}
          containerClassName="!p-0 !border-0 text-13 leading-5 text-secondary min-h-[60px]"
        />

        {/* Properties — same layout as issue detail sidebar */}
        <h5 className="mt-5 text-body-xs-medium">{t("common.properties")}</h5>
        <div className={`mb-2 mt-4 space-y-2.5 truncate ${!isEditingAllowed ? "opacity-60" : ""}`}>
          <SidebarPropertyListItem icon={StartDatePropertyIcon} label={t("date_range")}>
            <Controller
              control={control}
              name="start_date"
              render={({ field: { value: startDateValue, onChange: onChangeStartDate } }) => (
                <Controller
                  control={control}
                  name="target_date"
                  render={({ field: { value: endDateValue, onChange: onChangeEndDate } }) => {
                    const startDate = getDate(startDateValue);
                    const endDate = getDate(endDateValue);
                    return (
                      <DateRangeDropdown
                        buttonContainerClassName="w-full text-start h-7.5"
                        buttonVariant="transparent-with-text"
                        buttonClassName="text-body-xs-regular"
                        className="group w-full grow"
                        value={{ from: startDate, to: endDate }}
                        onSelect={(val) => {
                          onChangeStartDate(val?.from ? renderFormattedPayloadDate(val.from) : null);
                          onChangeEndDate(val?.to ? renderFormattedPayloadDate(val.to) : null);
                          handleDateChange(val?.from, val?.to);
                        }}
                        placeholder={{ from: t("start_date"), to: t("end_date") }}
                        disabled={!isEditingAllowed || isArchived}
                      />
                    );
                  }}
                />
              )}
            />
          </SidebarPropertyListItem>

          <SidebarPropertyListItem icon={UserCirclePropertyIcon} label={t("lead")}>
            <Controller
              control={control}
              name="lead_id"
              render={({ field: { value } }) => (
                <MemberDropdown
                  value={value ?? null}
                  onChange={(val) => {
                    void submitChanges({ lead_id: val });
                  }}
                  projectId={projectId?.toString() ?? ""}
                  multiple={false}
                  buttonVariant="transparent-with-text"
                  className="group w-full grow"
                  buttonContainerClassName="w-full text-start h-7.5"
                  buttonClassName={`text-body-xs-regular ${value ? "" : "text-placeholder"}`}
                  placeholder={t("lead")}
                  disabled={!isEditingAllowed || isArchived}
                  dropdownArrow
                  dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
                />
              )}
            />
          </SidebarPropertyListItem>

          <SidebarPropertyListItem icon={MembersPropertyIcon} label={t("members")}>
            <Controller
              control={control}
              name="member_ids"
              render={({ field: { value } }) => (
                <MemberDropdown
                  value={value ?? []}
                  onChange={(val: string[]) => {
                    void submitChanges({ member_ids: val });
                  }}
                  multiple
                  projectId={projectId?.toString() ?? ""}
                  buttonVariant={value && value.length > 1 ? "transparent-without-text" : "transparent-with-text"}
                  className="group w-full grow"
                  buttonContainerClassName="w-full text-start h-7.5"
                  buttonClassName={`text-body-xs-regular justify-between ${value && value.length > 0 ? "" : "text-placeholder"}`}
                  placeholder={t("members")}
                  disabled={!isEditingAllowed || isArchived}
                  dropdownArrow
                  dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
                />
              )}
            />
          </SidebarPropertyListItem>

          <SidebarPropertyListItem icon={LabelPropertyIcon} label={t("labels")}>
            <Controller
              control={control}
              name="label_ids"
              render={({ field: { value } }) => (
                <LabelDropdown
                  projectId={projectId?.toString() ?? null}
                  value={value ?? []}
                  onChange={(val) => {
                    void submitChanges({ label_ids: val });
                  }}
                  buttonClassName="group w-full text-start h-7.5 flex items-center rounded-sm px-2 hover:bg-layer-transparent-hover"
                  className="w-full grow"
                  fullWidth
                  hideDropdownArrow
                  disabled={!isEditingAllowed || isArchived}
                  label={
                    <span className={`text-body-xs-regular ${value && value.length > 0 ? "" : "text-placeholder"}`}>
                      {value && value.length > 0 ? `${value.length} ${t("labels")}` : t("labels")}
                    </span>
                  }
                />
              )}
            />
          </SidebarPropertyListItem>

          <SidebarPropertyListItem icon={WorkItemsIcon} label={t("issues")}>
            <span className="flex h-7.5 items-center px-2 text-body-xs-regular text-secondary">{issueCount}</span>
          </SidebarPropertyListItem>

          {isEstimatePointValid && (
            <SidebarPropertyListItem icon={EstimatePropertyIcon} label={t("points")}>
              <span className="flex h-7.5 items-center px-2 text-body-xs-regular text-secondary">
                {issueEstimatePointCount}
              </span>
            </SidebarPropertyListItem>
          )}
        </div>

        {/* Progress chart */}
        {workspaceSlug && projectId && moduleDetails?.id && (
          <ModuleAnalyticsProgress
            workspaceSlug={workspaceSlug.toString()}
            projectId={projectId.toString()}
            moduleId={moduleDetails?.id}
          />
        )}

        {/* Links */}
        <div className="mt-2 flex flex-col border-t border-subtle">
          <div className="flex w-full flex-col items-center justify-start gap-2 px-1.5 py-5">
            {/* Accessing link outside the disclosure as mobx is not considering the children inside Disclosure
                as part of the component hence not observing their state change */}
            <Disclosure defaultOpen={!!moduleDetails?.link_module?.length}>
              {({ open }) => (
                <div className={`relative flex h-full w-full flex-col ${open ? "" : "flex-row"}`}>
                  <Disclosure.Button className="flex w-full items-center justify-between gap-2 p-1.5">
                    <div className="flex items-center justify-start gap-2 text-13">
                      <span className="font-medium text-secondary">{t("common.links")}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 ${open ? "rotate-180 transform" : ""}`}
                        aria-hidden="true"
                      />
                    </div>
                  </Disclosure.Button>
                  <Transition show={open}>
                    <Disclosure.Panel>
                      <div className="mt-2 flex min-h-72 w-full flex-col space-y-3 overflow-y-auto">
                        {isEditingAllowed && moduleDetails.link_module && moduleDetails.link_module.length > 0 ? (
                          <>
                            {isEditingAllowed && !isArchived && (
                              <div className="flex w-full items-center justify-end">
                                <button
                                  className="flex items-center gap-1.5 text-13 font-medium text-accent-primary"
                                  onClick={() => setModuleLinkModal(true)}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                  {t("add_link")}
                                </button>
                              </div>
                            )}

                            {moduleId && (
                              <ModuleLinksList
                                moduleId={moduleId}
                                handleEditLink={handleEditLink}
                                handleDeleteLink={(linkId: string) => void handleDeleteLink(linkId)}
                                disabled={!isEditingAllowed || isArchived}
                              />
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Info className="h-3.5 w-3.5 stroke-[1.5] text-tertiary" />
                              <span className="p-0.5 text-11 text-tertiary">{t("common.no_links_added_yet")}</span>
                            </div>
                            {isEditingAllowed && !isArchived && (
                              <button
                                className="flex items-center gap-1.5 text-13 font-medium text-accent-primary"
                                onClick={() => setModuleLinkModal(true)}
                              >
                                <PlusIcon className="h-3 w-3" />
                                {t("add_link")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </Disclosure.Panel>
                  </Transition>
                </div>
              )}
            </Disclosure>
          </div>
        </div>
      </div>
    </div>
  );
});
