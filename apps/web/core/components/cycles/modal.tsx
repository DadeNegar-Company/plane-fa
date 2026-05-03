/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { mutate } from "swr";
// types
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { CycleDateCheckData, ICycle, TCycleTabOptions } from "@plane/types";
// ui
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// hooks
import { renderFormattedPayloadDate } from "@plane/utils";
import { useCycle } from "@/hooks/store/use-cycle";
import { useProject } from "@/hooks/store/use-project";
import useKeypress from "@/hooks/use-keypress";
import useLocalStorage from "@/hooks/use-local-storage";
import { usePlatformOS } from "@/hooks/use-platform-os";
// services
import { CycleService } from "@/services/cycle.service";
// local imports
import { CycleForm } from "./form";

type CycleModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  data?: ICycle | null;
  workspaceSlug: string;
  projectId: string;
};

// services
const cycleService = new CycleService();

export function CycleCreateUpdateModal(props: CycleModalProps) {
  const { isOpen, handleClose, data, workspaceSlug, projectId } = props;
  // states
  const [activeProject, setActiveProject] = useState<string | null>(null);
  // store hooks
  const { workspaceProjectIds } = useProject();
  const { createCycle, updateCycleDetails } = useCycle();
  const { isMobile } = usePlatformOS();
  const { t } = useTranslation();

  const { setValue: setCycleTab } = useLocalStorage<TCycleTabOptions>("cycle_tab", "active");

  const handleCreateCycle = async (payload: Partial<ICycle>) => {
    if (!workspaceSlug || !projectId) return;

    const selectedProjectId = payload.project_id ?? projectId.toString();
    await createCycle(workspaceSlug, selectedProjectId, payload)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((res) => {
        // mutate when the current cycle creation is active
        // eslint-disable-next-line promise/always-return
        if (payload.start_date && payload.end_date) {
          const currentDate = new Date();
          const cycleStartDate = new Date(payload.start_date);
          const cycleEndDate = new Date(payload.end_date);
          if (currentDate >= cycleStartDate && currentDate <= cycleEndDate) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            mutate(`PROJECT_ACTIVE_CYCLE_${selectedProjectId}`);
          }
        }

        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("common.success"),
          message: t("project_cycles.action.create.success.description"),
        });
      })
      .catch((err) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: err?.detail ?? t("project_cycles.action.create.failed.description"),
        });
      });
  };

  const handleUpdateCycle = async (cycleId: string, payload: Partial<ICycle>) => {
    if (!workspaceSlug || !projectId) return;

    const selectedProjectId = payload.project_id ?? projectId.toString();
    await updateCycleDetails(workspaceSlug, selectedProjectId, cycleId, payload)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, promise/always-return
      .then((res) => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("common.success"),
          message: t("project_cycles.action.update.success.description"),
        });
      })
      .catch((err) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: err?.detail ?? t("project_cycles.action.update.failed.description"),
        });
      });
  };

  const dateChecker = async (projectId: string, payload: CycleDateCheckData) => {
    let status = false;

    // eslint-disable-next-line promise/always-return
    await cycleService.cycleDateCheck(workspaceSlug, projectId, payload).then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      status = res.status;
    });

    return status;
  };

  const handleFormSubmit = async (formData: Partial<ICycle>) => {
    if (!workspaceSlug || !projectId) return;

    const payload: Partial<ICycle> = {
      ...formData,
      start_date: renderFormattedPayloadDate(formData.start_date) ?? null,
      end_date: renderFormattedPayloadDate(formData.end_date) ?? null,
    };

    let isDateValid: boolean = true;

    if (payload.start_date && payload.end_date) {
      if (data?.id) {
        // Update existing cycle - only check dates if they've changed
        const originalStartDate = renderFormattedPayloadDate(data.start_date) ?? null;
        const originalEndDate = renderFormattedPayloadDate(data.end_date) ?? null;
        const hasDateChanged = payload.start_date !== originalStartDate || payload.end_date !== originalEndDate;

        if (hasDateChanged) {
          isDateValid = await dateChecker(projectId, {
            start_date: payload.start_date,
            end_date: payload.end_date,
            cycle_id: data.id,
          });
        }
      } else {
        // Create new cycle - always check dates
        isDateValid = await dateChecker(projectId, {
          start_date: payload.start_date,
          end_date: payload.end_date,
        });
      }
    }

    if (isDateValid) {
      if (data?.id) await handleUpdateCycle(data.id, payload);
      else {
        // eslint-disable-next-line promise/always-return
        await handleCreateCycle(payload).then(() => {
          setCycleTab("all");
        });
      }
      handleClose();
    } else
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("project_cycles.action.create.error.already_exists"),
      });
  };

  useEffect(() => {
    // if modal is closed, reset active project to null
    // and return to avoid activeProject being set to some other project
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveProject(null);
      return;
    }

    // if data is present, set active project to the project of the
    // issue. This has more priority than the project in the url.
    if (data && data.project_id) {
      setActiveProject(data.project_id);
      return;
    }

    // if data is not present, set active project to the project
    // in the url. This has the least priority.
    if (workspaceProjectIds && workspaceProjectIds.length > 0 && !activeProject)
      setActiveProject(projectId ?? workspaceProjectIds?.[0] ?? null);
  }, [activeProject, data, projectId, workspaceProjectIds, isOpen]);

  useKeypress("Escape", () => {
    if (isOpen) handleClose();
  });

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.TOP} width={EModalWidth.XXL}>
      <CycleForm
        handleFormSubmit={handleFormSubmit}
        handleClose={handleClose}
        status={!!data}
        projectId={activeProject ?? ""}
        setActiveProject={setActiveProject}
        data={data}
        isMobile={isMobile}
      />
    </ModalCore>
  );
}
