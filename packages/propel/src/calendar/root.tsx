/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeftIcon } from "../icons/arrows/chevron-left";

import { cn } from "../utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// [FA-CUSTOM] Read the document direction set by the store-wrapper effect so the
// DayPicker mirrors weekday columns and prev/next chevrons under dir=rtl.
const useDocumentDir = (): "ltr" | "rtl" => {
  const [dir, setDir] = React.useState<"ltr" | "rtl">(() =>
    typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr"
  );
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const update = () => setDir(el.dir === "rtl" ? "rtl" : "ltr");
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);
  return dir;
};

export function Calendar({ className, showOutsideDays = true, dir, ...props }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const thirtyYearsAgoFirstDay = new Date(currentYear - 30, 0, 1);
  const thirtyYearsFromNowFirstDay = new Date(currentYear + 30, 11, 31);
  const documentDir = useDocumentDir();
  const resolvedDir = dir ?? documentDir;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      weekStartsOn={props.weekStartsOn}
      dir={resolvedDir}
      components={{
        Chevron: ({ className, ...props }) => (
          <ChevronLeftIcon
            className={cn(
              "size-4",
              { "rotate-180": props.orientation === "right", "-rotate-90": props.orientation === "down" },
              className
            )}
            {...props}
          />
        ),
      }}
      startMonth={thirtyYearsAgoFirstDay}
      endMonth={thirtyYearsFromNowFirstDay}
      {...props}
    />
  );
}
