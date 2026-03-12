/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Time tracking — sidebar property showing total logged time + estimated vs actual

import { observer } from "mobx-react";
import { Timer } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { EEstimateSystem } from "@plane/types";
import { convertMinutesToHoursMinutesString, cn } from "@plane/utils";
// components
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";

type TIssueWorklogProperty = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

const TimerIcon = ({ className }: { className?: string }) => <Timer className={className} />;

export const IssueWorklogProperty = observer(function IssueWorklogProperty(props: TIssueWorklogProperty) {
  const { projectId, issueId } = props;
  // i18n
  const { t } = useTranslation();
  // store hooks
  const { getProjectById } = useProject();
  const {
    worklog: { getTotalMinutesByIssueId },
    issue: { getIssueById },
  } = useIssueDetail();
  const { currentProjectEstimateType } = useProjectEstimates();

  const project = getProjectById(projectId);

  // hide if time tracking is not enabled
  if (!project?.is_time_tracking_enabled) return <></>;

  const issue = getIssueById(issueId);
  const totalMinutes = getTotalMinutesByIssueId(issueId);
  const loggedDisplay = totalMinutes > 0 ? convertMinutesToHoursMinutesString(totalMinutes) : "—";

  // determine if we have a time-based estimate for comparison
  const hasTimeEstimate =
    currentProjectEstimateType === EEstimateSystem.TIME && issue?.estimate_point != null && issue.estimate_point !== "";
  const estimatedMinutes = hasTimeEstimate ? Number(issue?.estimate_point) : 0;
  const estimatedDisplay = estimatedMinutes > 0 ? convertMinutesToHoursMinutesString(estimatedMinutes) : null;

  // progress percentage (capped at 100% for visual, shows overflow via color)
  const progressPercent = estimatedMinutes > 0 ? Math.min((totalMinutes / estimatedMinutes) * 100, 100) : 0;
  const isOverEstimate = estimatedMinutes > 0 && totalMinutes > estimatedMinutes;

  return (
    <SidebarPropertyListItem icon={TimerIcon} label={t("common.time_logged")}>
      <div className="flex flex-col gap-1 w-full">
        <span className="text-body-xs-regular text-secondary h-7.5 flex items-center gap-1">
          {loggedDisplay}
          {estimatedDisplay && <span className="text-tertiary">/ {estimatedDisplay}</span>}
        </span>
        {estimatedMinutes > 0 && totalMinutes > 0 && (
          <div className="w-full h-1.5 rounded-full bg-layer-3 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isOverEstimate ? "bg-red-500" : "bg-green-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </SidebarPropertyListItem>
  );
});
