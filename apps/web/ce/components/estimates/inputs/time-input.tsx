/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { convertMinutesToHoursAndMinutes, convertHoursMinutesToMinutes } from "@plane/utils";

export type TEstimateTimeInputProps = {
  value?: number;
  handleEstimateInputValue: (value: string) => void;
};

export function EstimateTimeInput(props: TEstimateTimeInputProps) {
  const { value, handleEstimateInputValue } = props;

  const { hours, minutes } = value ? convertMinutesToHoursAndMinutes(value) : { hours: 0, minutes: 0 };

  const emitValue = (newHours: number, newMinutes: number) => {
    const totalMinutes = convertHoursMinutesToMinutes(Math.max(0, newHours), Math.min(59, Math.max(0, newMinutes)));
    handleEstimateInputValue(String(totalMinutes));
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 w-full">
      <input
        type="number"
        min={0}
        max={999}
        value={hours || ""}
        onChange={(e) => emitValue(parseInt(e.target.value) || 0, minutes)}
        className="border-none focus:ring-0 focus:outline-none w-16 bg-transparent text-13 text-center"
        placeholder="0"
      />
      <span className="text-13 text-tertiary flex-shrink-0">h</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes || ""}
        onChange={(e) => emitValue(hours, parseInt(e.target.value) || 0)}
        className="border-none focus:ring-0 focus:outline-none w-16 bg-transparent text-13 text-center"
        placeholder="0"
      />
      <span className="text-13 text-tertiary flex-shrink-0">m</span>
    </div>
  );
}
