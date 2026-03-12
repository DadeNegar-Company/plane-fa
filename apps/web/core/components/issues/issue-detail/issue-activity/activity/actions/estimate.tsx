/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { EstimatePropertyIcon } from "@plane/propel/icons";
import { EEstimateSystem } from "@plane/types";
import { convertMinutesToHoursMinutesString } from "@plane/utils";
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";

type TIssueEstimateActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssueEstimateActivity = observer(function IssueEstimateActivity(props: TIssueEstimateActivity) {
  const { activityId, showIssue = true, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();
  const { currentActiveEstimateIdByProjectId, getEstimateById } = useProjectEstimates();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;

  // Format estimate value based on estimate type (show "2h 30m" for TIME instead of raw "150")
  const activeEstimateId = activity.project ? currentActiveEstimateIdByProjectId(activity.project) : undefined;
  const activeEstimate = activeEstimateId ? getEstimateById(activeEstimateId) : undefined;
  const isTimeEstimate = activeEstimate?.type === EEstimateSystem.TIME;

  const formatValue = (value: string | undefined) => {
    if (!value) return value;
    if (isTimeEstimate && !isNaN(Number(value))) return convertMinutesToHoursMinutesString(Number(value)).trim();
    return value;
  };

  return (
    <IssueActivityBlockComponent
      icon={<EstimatePropertyIcon className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        {activity.new_value ? `set the estimate point to ` : `removed the estimate point`}
        {activity.new_value ? formatValue(activity.new_value) : formatValue(activity?.old_value)}
        {showIssue && (activity.new_value ? ` to ` : ` from `)}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
