/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FC } from "react";
import { MoveRight } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
// assets
import emptyIssue from "@/app/assets/empty-state/issue.svg?url";
// components
import { EmptyState } from "@/components/common/empty-state";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";

type TIssuePeekOverviewError = {
  removeRoutePeekId: () => void;
};

export function IssuePeekOverviewError(props: TIssuePeekOverviewError) {
  const { removeRoutePeekId } = props;
  // hooks
  const { isMobile } = usePlatformOS();
  const { t } = useTranslation();

  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col">
      <div className="flex-shrink-0 flex justify-start">
        <Tooltip tooltipContent={t("common.close_peek_view")} isMobile={isMobile}>
          <button onClick={removeRoutePeekId} className="w-5 h-5 m-5">
            <MoveRight className="h-4 w-4 text-tertiary hover:text-secondary" />
          </button>
        </Tooltip>
      </div>

      <div className="w-full h-full">
        <EmptyState
          image={emptyIssue ?? undefined}
          title={t("common.work_item_does_not_exist_title")}
          description={t("common.work_item_does_not_exist_description")}
        />
      </div>
    </div>
  );
}
