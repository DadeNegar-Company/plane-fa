/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
// plane imports
import { ETabIndices } from "@plane/constants";
import type { EditorRefApi } from "@plane/editor";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import type { IModule } from "@plane/types";
import { EFileAssetType } from "@plane/types";
// ui
import { Input } from "@plane/ui";
import { getDate, getDescriptionPlaceholderI18n, renderFormattedPayloadDate, getTabIndex } from "@plane/utils";
// components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { ProjectDropdown } from "@/components/dropdowns/project/dropdown";
import { RichTextEditor } from "@/components/editor/rich-text";
import { LabelDropdown } from "@/components/issues/issue-layouts/properties/label-dropdown";
import { ModuleStatusSelect } from "@/components/modules";
// hooks
import { useEditorAsset } from "@/hooks/store/use-editor-asset";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUser } from "@/hooks/store/user/user-user";
// services
import { WorkspaceService } from "@/services/workspace.service";

const workspaceService = new WorkspaceService();

type Props = {
  handleFormSubmit: (values: Partial<IModule>, dirtyFields: Partial<Record<keyof IModule, boolean>>) => Promise<void>;
  handleClose: () => void;
  status: boolean;
  projectId: string;
  workspaceSlug: string;
  setActiveProject: React.Dispatch<React.SetStateAction<string | null>>;
  data?: IModule;
  isMobile?: boolean;
};

const defaultValues: Partial<IModule> = {
  name: "",
  description: "",
  description_html: "",
  status: "backlog",
  lead_id: null,
  member_ids: [],
  label_ids: [],
};

export function ModuleForm(props: Props) {
  const {
    handleFormSubmit,
    handleClose,
    status,
    projectId,
    workspaceSlug,
    setActiveProject,
    data,
    isMobile = false,
  } = props;
  // refs
  const editorRef = useRef<EditorRefApi | null>(null);
  // store hooks
  const { projectsWithCreatePermissions } = useUser();
  const { getWorkspaceBySlug } = useWorkspace();
  const { uploadEditorAsset, duplicateEditorAsset } = useEditorAsset();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug)?.id ?? "";
  // form info
  const {
    formState: { errors, isSubmitting, dirtyFields },
    handleSubmit,
    control,
    reset,
  } = useForm<IModule>({
    defaultValues: {
      project_id: projectId,
      name: data?.name || "",
      description: data?.description || "",
      description_html: data?.description_html || "",
      status: data?.status || "backlog",
      lead_id: data?.lead_id || null,
      member_ids: data?.member_ids || [],
      label_ids: data?.label_ids || [],
    },
  });

  const { getIndex } = getTabIndex(ETabIndices.PROJECT_MODULE, isMobile);

  const { t } = useTranslation();

  const handleCreateUpdateModule = async (formData: Partial<IModule>) => {
    await handleFormSubmit(formData, dirtyFields);

    reset({
      ...defaultValues,
    });
  };

  useEffect(() => {
    reset({
      ...defaultValues,
      ...data,
    });
  }, [data, reset]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit(handleCreateUpdateModule)}>
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-x-3">
          {!status && (
            <Controller
              control={control}
              name="project_id"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <ProjectDropdown
                    value={value}
                    onChange={(val) => {
                      if (!Array.isArray(val)) {
                        onChange(val);
                        setActiveProject(val);
                      }
                    }}
                    multiple={false}
                    buttonVariant="border-with-text"
                    renderCondition={(projectId) => !!projectsWithCreatePermissions?.[projectId]}
                    tabIndex={getIndex("cover_image")}
                  />
                </div>
              )}
            />
          )}
          <h3 className="text-18 font-medium text-secondary">
            {status ? t("common.update") : t("common.create")} {t("common.module").toLowerCase()}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Controller
              control={control}
              name="name"
              rules={{
                required: t("title_is_required"),
                maxLength: {
                  value: 255,
                  message: t("title_should_be_less_than_255_characters"),
                },
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors?.name)}
                  placeholder={t("title")}
                  className="w-full text-14"
                  tabIndex={getIndex("name")}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              )}
            />
            <span className="text-11 text-danger-primary">{errors?.name?.message}</span>
          </div>
          <div className="border-[0.5px] border-subtle-1 bg-layer-2 rounded-lg">
            <Controller
              name="description_html"
              control={control}
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
                  editable
                  id="module-modal-editor"
                  initialValue={value ?? ""}
                  value={null}
                  workspaceSlug={workspaceSlug}
                  workspaceId={workspaceId}
                  projectId={projectId}
                  onChange={(_description: object, description_html: string) => {
                    onChange(description_html);
                  }}
                  ref={editorRef}
                  tabIndex={getIndex("description")}
                  placeholder={(isFocused, description) => t(getDescriptionPlaceholderI18n(isFocused, description))}
                  searchMentionCallback={async (payload) =>
                    await workspaceService.searchEntity(workspaceSlug, {
                      ...payload,
                      project_id: projectId,
                    })
                  }
                  containerClassName="pt-3 min-h-[120px]"
                  uploadFile={async (blockId, file) => {
                    const { asset_id } = await uploadEditorAsset({
                      blockId,
                      data: {
                        entity_identifier: data?.id ?? "",
                        entity_type: EFileAssetType.MODULE_DESCRIPTION,
                      },
                      file,
                      projectId,
                      workspaceSlug,
                    });
                    return asset_id;
                  }}
                  duplicateFile={async (assetId: string) => {
                    const { asset_id } = await duplicateEditorAsset({
                      assetId,
                      entityId: data?.id,
                      entityType: EFileAssetType.MODULE_DESCRIPTION,
                      projectId,
                      workspaceSlug,
                    });
                    return asset_id;
                  }}
                />
              )}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Controller
              control={control}
              name="start_date"
              render={({ field: { value: startDateValue, onChange: onChangeStartDate } }) => (
                <Controller
                  control={control}
                  name="target_date"
                  render={({ field: { value: endDateValue, onChange: onChangeEndDate } }) => (
                    <DateRangeDropdown
                      buttonVariant="border-with-text"
                      className="h-7"
                      value={{
                        from: getDate(startDateValue),
                        to: getDate(endDateValue),
                      }}
                      onSelect={(val) => {
                        onChangeStartDate(val?.from ? renderFormattedPayloadDate(val.from) : null);
                        onChangeEndDate(val?.to ? renderFormattedPayloadDate(val.to) : null);
                      }}
                      placeholder={{
                        from: t("start_date"),
                        to: t("end_date"),
                      }}
                      hideIcon={{
                        to: true,
                      }}
                      tabIndex={getIndex("date_range")}
                    />
                  )}
                />
              )}
            />
            <div className="h-7">
              <ModuleStatusSelect control={control} error={errors.status} tabIndex={getIndex("status")} />
            </div>
            <Controller
              control={control}
              name="lead_id"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <MemberDropdown
                    value={value}
                    onChange={onChange}
                    projectId={projectId}
                    multiple={false}
                    buttonVariant="border-with-text"
                    placeholder={t("lead")}
                    tabIndex={getIndex("lead")}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="member_ids"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <MemberDropdown
                    value={value}
                    onChange={onChange}
                    projectId={projectId}
                    multiple
                    buttonVariant={value && value.length > 0 ? "transparent-without-text" : "border-with-text"}
                    buttonClassName={value && value.length > 0 ? "hover:bg-transparent px-0" : ""}
                    placeholder={t("members")}
                    tabIndex={getIndex("member_ids")}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="label_ids"
              render={({ field: { value, onChange } }) => (
                <div className="h-7">
                  <LabelDropdown
                    projectId={projectId}
                    value={value ?? []}
                    onChange={onChange}
                    buttonClassName="justify-start gap-1.5 border-[0.5px] border-strong rounded-sm px-1.5"
                    className="h-7"
                    fullHeight
                    hideDropdownArrow
                    label={
                      <span className="flex-grow truncate text-start text-body-xs-medium">
                        {value && value.length > 0 ? (
                          <span>{`${value.length} ${t("labels")}`}</span>
                        ) : (
                          <span className="text-placeholder">{t("labels")}</span>
                        )}
                      </span>
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-subtle">
        <Button variant="secondary" size="lg" onClick={handleClose} tabIndex={getIndex("cancel")}>
          {t("cancel")}
        </Button>
        <Button variant="primary" size="lg" type="submit" loading={isSubmitting} tabIndex={getIndex("submit")}>
          {status
            ? isSubmitting
              ? t("updating")
              : t("project_module.update_module")
            : isSubmitting
              ? t("creating")
              : t("project_module.create_module")}
        </Button>
      </div>
    </form>
  );
}
