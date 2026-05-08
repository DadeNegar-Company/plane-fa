/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { getOrderedDays, getEffectiveStartOfWeek, getWeekendDays } from "@plane/utils"; // [FA-CUSTOM] added getEffectiveStartOfWeek, getWeekendDays
import { DAYS_LIST } from "@/constants/calendar";
// helpers
// hooks
import { useUserProfile } from "@/hooks/store/user";

type Props = {
  isLoading: boolean;
  showWeekends: boolean;
};

export const CalendarWeekHeader = observer(function CalendarWeekHeader(props: Props) {
  const { isLoading, showWeekends } = props;
  // hooks
  const { data } = useUserProfile();
  // [FA-CUSTOM] Force Saturday in Jalali; honor user setting in Gregorian.
  const startOfWeek = getEffectiveStartOfWeek(data?.start_of_the_week);
  // [FA-CUSTOM] Calendar-aware weekend day indices used to filter the header columns
  const weekendDays = getWeekendDays();

  // derived
  const orderedDays = getOrderedDays(Object.values(DAYS_LIST), (item) => item.value, startOfWeek);

  return (
    <div
      className={`relative sticky top-0 z-[1] grid md:divide-x-[0.5px] divide-subtle-1 text-13 font-medium ${
        showWeekends ? "grid-cols-7" : "grid-cols-5"
      }`}
    >
      {isLoading && (
        <div className="absolute h-[1.5px] w-3/4 animate-[bar-loader_2s_linear_infinite] bg-accent-primary" />
      )}
      {orderedDays.map((day) => {
        // [FA-CUSTOM] Hide weekend columns based on the active calendar's weekend days.
        if (!showWeekends && weekendDays.includes(day.value)) return null;

        return (
          <div key={day.shortTitle} className="flex h-11 items-center justify-center md:justify-end bg-layer-1 px-4">
            {day.shortTitle}
          </div>
        );
      })}
    </div>
  );
});
