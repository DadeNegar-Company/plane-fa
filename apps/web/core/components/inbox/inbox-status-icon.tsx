/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TInboxIssueStatus } from "@plane/types";
import { cn } from "@plane/utils";
import { ICON_PROPERTIES } from "./inbox-status-icon-properties";

export function InboxStatusIcon({
  type,
  size,
  className,
  renderColor = true,
}: {
  type: TInboxIssueStatus;
  size?: number;
  className?: string;
  renderColor?: boolean;
}) {
  if (type === undefined) return null;
  const Icon = ICON_PROPERTIES[type];
  if (!Icon) return null;
  return <Icon.icon size={size} className={cn(`w-3 h-3 ${renderColor && Icon?.textColor(false)}`, className)} />;
}
