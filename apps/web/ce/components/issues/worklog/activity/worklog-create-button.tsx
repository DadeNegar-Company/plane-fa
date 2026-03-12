/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Time tracking — "Log Time" button with popover form

import { useState, useCallback } from "react";
import { observer } from "mobx-react";
import { Timer } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { Popover } from "@plane/propel/popover";
import { renderFormattedPayloadDate } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";

type TIssueActivityWorklogCreateButton = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export const IssueActivityWorklogCreateButton = observer(function IssueActivityWorklogCreateButton(
  props: TIssueActivityWorklogCreateButton
) {
  const { workspaceSlug, projectId, issueId, disabled } = props;
  // i18n
  const { t } = useTranslation();
  // state
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [dateWorked, setDateWorked] = useState(renderFormattedPayloadDate(new Date()) ?? "");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // store hooks
  const { getProjectById } = useProject();
  const {
    worklog: { createWorklog },
  } = useIssueDetail();

  const project = getProjectById(projectId);
  if (!project?.is_time_tracking_enabled) return <></>;

  const totalMinutes = hours * 60 + minutes;
  const isValid = totalMinutes > 0 && dateWorked.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createWorklog(workspaceSlug, projectId, issueId, {
        duration_minutes: totalMinutes,
        date_worked: dateWorked,
        description: description.trim(),
      });
      // reset form
      setHours(0);
      setMinutes(0);
      setDateWorked(renderFormattedPayloadDate(new Date()) ?? "");
      setDescription("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, createWorklog, workspaceSlug, projectId, issueId, totalMinutes, dateWorked, description]);

  const handleReset = useCallback(() => {
    setHours(0);
    setMinutes(0);
    setDateWorked(renderFormattedPayloadDate(new Date()) ?? "");
    setDescription("");
    setIsOpen(false);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Button
        render={
          <Button variant="neutral-primary" size="sm" disabled={disabled} prependIcon={<Timer />}>
            {t("common.log_time")}
          </Button>
        }
      />
      <Popover.Panel
        side="bottom"
        align="end"
        sideOffset={8}
        className="z-20 w-72 rounded-lg border border-subtle bg-layer-1 p-4 shadow-lg"
      >
        <div className="space-y-3">
          {/* Duration inputs */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-caption-xs-regular text-tertiary mb-1 block">{t("common.hours")}</label>
              <input
                type="number"
                min={0}
                max={999}
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-subtle bg-layer-2 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-caption-xs-regular text-tertiary mb-1 block">{t("common.minutes")}</label>
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full rounded-md border border-subtle bg-layer-2 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-caption-xs-regular text-tertiary mb-1 block">{t("common.date_worked")}</label>
            <input
              type="date"
              value={dateWorked}
              onChange={(e) => setDateWorked(e.target.value)}
              max={renderFormattedPayloadDate(new Date()) ?? ""}
              className="w-full rounded-md border border-subtle bg-layer-2 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-caption-xs-regular text-tertiary mb-1 block">{t("common.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t("common.description")}
              className="w-full resize-none rounded-md border border-subtle bg-layer-2 px-2.5 py-1.5 text-body-sm-regular text-primary outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="neutral-primary" size="sm" onClick={handleReset}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
              {isSubmitting ? t("common.creating") : t("common.log_time")}
            </Button>
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
});
