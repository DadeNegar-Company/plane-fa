/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Timer / Stopwatch — Start/Stop button on issue detail

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react";
import { Play, Square } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { formatElapsedTime, renderFormattedPayloadDate } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";
import { useTimer } from "@/hooks/store/use-timer";

type TTimerButton = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export const TimerButton = observer(function TimerButton(props: TTimerButton) {
  const { workspaceSlug, projectId, issueId, disabled } = props;
  // store hooks
  const { getProjectById } = useProject();
  const timer = useTimer();
  const {
    worklog: { createWorklog },
  } = useIssueDetail();
  // local state for tick
  const [elapsed, setElapsed] = useState(0);

  const project = getProjectById(projectId);
  const isTimeTrackingEnabled = !!project?.is_time_tracking_enabled;
  const isThisIssueActive = timer.activeTimer?.issueId === issueId;
  const isAnotherIssueActive = timer.isTimerRunning && !isThisIssueActive;

  // tick every second when this issue's timer is active
  useEffect(() => {
    if (!isThisIssueActive) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(timer.getElapsedSeconds());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isThisIssueActive, timer]);

  const handleStart = useCallback(() => {
    timer.startTimer(workspaceSlug, projectId, issueId);
  }, [timer, workspaceSlug, projectId, issueId]);

  const handleStop = useCallback(async () => {
    const stoppedTimer = timer.stopTimer();
    if (!stoppedTimer) return;
    const totalSeconds = Math.floor((Date.now() - stoppedTimer.startedAt) / 1000);
    const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
    try {
      await createWorklog(stoppedTimer.workspaceSlug, stoppedTimer.projectId, stoppedTimer.issueId, {
        duration_minutes: totalMinutes,
        date_worked: renderFormattedPayloadDate(new Date()) ?? "",
        description: "",
      });
    } catch {
      // Restore the timer so the user doesn't lose tracked time
      timer.startTimer(stoppedTimer.workspaceSlug, stoppedTimer.projectId, stoppedTimer.issueId);
    }
  }, [timer, createWorklog]);

  // hide if time tracking is not enabled
  if (!isTimeTrackingEnabled) return <></>;

  if (isThisIssueActive) {
    return (
      <Button variant="danger" size="sm" onClick={handleStop} prependIcon={<Square />}>
        {formatElapsedTime(elapsed)}
      </Button>
    );
  }

  return (
    <Button
      variant="neutral-primary"
      size="sm"
      onClick={handleStart}
      disabled={disabled || isAnotherIssueActive}
      prependIcon={<Play />}
    >
      Start
    </Button>
  );
});
