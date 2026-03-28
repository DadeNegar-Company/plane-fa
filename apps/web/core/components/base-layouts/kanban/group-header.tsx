/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Circle, Minimize2, Maximize2 } from "lucide-react";
import type { IGroupHeaderProps } from "@plane/types";

export function GroupHeader({ group, itemCount, isCollapsed, onToggleGroup }: IGroupHeaderProps) {
  return (
    <div
      className={`relative flex flex-shrink-0 gap-1 py-1.5 ${
        isCollapsed ? "w-[44px] flex-col items-center" : "w-full flex-row items-center"
      }`}
    >
      <div className="flex size-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-xs">
        {group.icon ? group.icon : <Circle width={14} strokeWidth={2} />}
      </div>
      <div
        className={`relative flex gap-1 ${
          isCollapsed ? "flex-col items-center" : "w-full flex-row items-baseline overflow-hidden"
        }`}
      >
        <div
          className={`line-clamp-1 inline-block overflow-hidden truncate font-medium text-primary ${
            isCollapsed ? "vertical-lr max-h-[400px]" : ""
          }`}
        >
          {group.name}
        </div>
        <div className={`flex-shrink-0 text-13 font-medium text-tertiary ${isCollapsed ? "pr-0.5" : "pl-2"}`}>
          {itemCount}
        </div>
      </div>
      <button
        className="flex h-[20px] w-[20px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover bg-layer-transparent"
        onClick={() => onToggleGroup(group.id)}
      >
        {isCollapsed ? <Maximize2 width={14} strokeWidth={2} /> : <Minimize2 width={14} strokeWidth={2} />}
      </button>
    </div>
  );
}
