/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Time tracking — worklog entry in activity feed

import { observer } from "mobx-react";
import { Timer } from "lucide-react";
// plane imports
import type { TIssueActivityComment } from "@plane/types";
import { Tooltip } from "@plane/propel/tooltip";
import {
  convertMinutesToHoursMinutesString,
  renderFormattedDate,
  renderFormattedTime,
  calculateTimeAgo,
} from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useMember } from "@/hooks/store/use-member";
import { usePlatformOS } from "@/hooks/use-platform-os";

type TIssueActivityWorklog = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  activityComment: TIssueActivityComment;
  ends?: "top" | "bottom";
};

export const IssueActivityWorklog = observer(function IssueActivityWorklog(props: TIssueActivityWorklog) {
  const { activityComment, ends } = props;
  // store hooks
  const {
    worklog: { getWorklogById },
  } = useIssueDetail();
  const {
    project: { getProjectMemberDetails },
  } = useMember();
  const { isMobile } = usePlatformOS();

  const worklog = getWorklogById(activityComment.id);
  if (!worklog) return <></>;

  const memberDetails = getProjectMemberDetails(worklog.actor);
  const displayName = worklog.actor_detail?.display_name ?? memberDetails?.member?.display_name ?? "Someone";
  const durationStr = convertMinutesToHoursMinutesString(worklog.duration_minutes);
  const dateWorkedStr = renderFormattedDate(worklog.date_worked);

  return (
    <div
      className={`relative flex items-center gap-3 text-caption-sm-regular ${
        ends === "top" ? "pb-2" : ends === "bottom" ? "pt-2" : "py-2"
      }`}
    >
      <div className="absolute left-[13px] top-0 bottom-0 w-px bg-layer-3" aria-hidden />
      <div className="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden flex justify-center items-center z-[4] bg-layer-2 text-secondary border border-subtle shadow-raised-100">
        <Timer className="w-3.5 h-3.5" />
      </div>
      <div className="w-full truncate text-secondary">
        <span className="font-medium text-primary">{displayName}</span>
        <span>
          {" "}
          logged <span className="font-medium text-primary">{durationStr}</span> on {dateWorkedStr}
        </span>
        {worklog.description && <span className="text-tertiary"> — {worklog.description}</span>}
        <span>
          <Tooltip
            isMobile={isMobile}
            tooltipContent={`${renderFormattedDate(worklog.created_at)}, ${renderFormattedTime(worklog.created_at)}`}
          >
            <span className="whitespace-nowrap text-tertiary"> {calculateTimeAgo(worklog.created_at)}</span>
          </Tooltip>
        </span>
      </div>
    </div>
  );
});
