/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Persistent timer indicator — visible globally when a timer is running

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react";
import { Square, Timer } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { renderFormattedPayloadDate } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useTimer } from "@/hooks/store/use-timer";

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const ActiveTimerIndicator = observer(function ActiveTimerIndicator() {
  const timer = useTimer();
  const {
    worklog: { createWorklog },
    issue: { getIssueById },
  } = useIssueDetail();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!timer.isTimerRunning) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(timer.getElapsedSeconds());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timer, timer.isTimerRunning]);

  const handleStop = useCallback(async () => {
    const stoppedTimer = timer.stopTimer();
    if (!stoppedTimer) return;
    const totalSeconds = Math.floor((Date.now() - stoppedTimer.startedAt) / 1000);
    const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
    await createWorklog(stoppedTimer.workspaceSlug, stoppedTimer.projectId, stoppedTimer.issueId, {
      duration_minutes: totalMinutes,
      date_worked: renderFormattedPayloadDate(new Date()) ?? "",
      description: "",
    });
  }, [timer, createWorklog]);

  const handleCancel = useCallback(() => {
    timer.cancelTimer();
  }, [timer]);

  if (!timer.isTimerRunning || !timer.activeTimer) return null;

  const issue = getIssueById(timer.activeTimer.issueId);
  const issueIdentifier = issue?.project_identifier ? `${issue.project_identifier}-${issue.sequence_id}` : "Work item";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-subtle bg-layer-1 px-4 py-2.5 shadow-lg">
      <Timer className="size-4 text-primary animate-pulse" />
      <span className="text-body-sm-medium text-primary">{issueIdentifier}</span>
      <span className="text-body-sm-regular text-secondary font-mono">{formatElapsed(elapsed)}</span>
      <Button variant="danger" size="sm" onClick={handleStop} prependIcon={<Square />}>
        Stop
      </Button>
      <button className="text-caption-xs-regular text-tertiary hover:text-secondary" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  );
});
