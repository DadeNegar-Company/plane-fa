/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { format as gregorianFormat, isValid } from "date-fns";
// [FA-CUSTOM] Gregorian locales — Persian month names when language=fa
import { enUS as gregorianEnUS } from "date-fns/locale/en-US";
import { faIR as gregorianFaIR } from "date-fns/locale/fa-IR";
// [FA-CUSTOM] Jalali calendar support
import { format as jalaliFormat } from "date-fns-jalali";
import { enUS as jalaliEnUS } from "date-fns-jalali/locale/en-US";
import { faIR as jalaliFaIR } from "date-fns-jalali/locale/fa-IR";
import { isNumber } from "lodash-es";
// [FA-CUSTOM] Shared date-display language (kept in sync by the i18n store)
import { getDateLocaleLanguage } from "@plane/utils";

// [FA-CUSTOM] Locale-aware wrappers — the month-name SCRIPT follows the UI
// language (fa → Persian "فروردین"/"ژانویه", else Latin), read at call time.
const jalaliFormatLocalized: typeof gregorianFormat = (date, formatStr, options) =>
  jalaliFormat(date, formatStr, { locale: getDateLocaleLanguage() === "fa" ? jalaliFaIR : jalaliEnUS, ...options });

const gregorianFormatLocalized: typeof gregorianFormat = (date, formatStr, options) =>
  gregorianFormat(date, formatStr, {
    locale: getDateLocaleLanguage() === "fa" ? gregorianFaIR : gregorianEnUS,
    ...options,
  });

// [FA-CUSTOM] Module-level calendar system state for Space app
let _spaceCalendarSystem: "gregorian" | "jalali" = "gregorian";
let activeFormat: typeof gregorianFormat = gregorianFormatLocalized;

export const setSpaceCalendarSystem = (system: "gregorian" | "jalali") => {
  _spaceCalendarSystem = system;
  activeFormat = system === "jalali" ? jalaliFormatLocalized : gregorianFormatLocalized;
};

/**
 * [FA-CUSTOM] Convert a Gregorian-order format token to Jalali day-first order.
 */
const jalaliFormatToken = (token: string): string => {
  if (_spaceCalendarSystem !== "jalali") return token;
  switch (token) {
    case "MMM dd, yyyy":
      return "dd MMM yyyy";
    case "MMM dd":
      return "dd MMM";
    default:
      return token;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const timeAgo = (time: any) => {
  switch (typeof time) {
    case "number":
      break;
    case "string":
      time = +new Date(time);
      break;
    case "object":
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
};

/**
 * This method returns a date from string of type yyyy-mm-dd
 * This method is recommended to use instead of new Date() as this does not introduce any timezone offsets
 * @param date
 * @returns date or undefined
 */
export const getDate = (date: string | Date | undefined | null): Date | undefined => {
  try {
    if (!date || date === "") return;

    if (typeof date !== "string" && !(date instanceof String)) return date;

    const [yearString, monthString, dayString] = date.substring(0, 10).split("-");
    const year = parseInt(yearString);
    const month = parseInt(monthString);
    const day = parseInt(dayString);
    if (!isNumber(year) || !isNumber(month) || !isNumber(day)) return;

    return new Date(year, month - 1, day);
  } catch (_err) {
    return undefined;
  }
};

/**
 * @returns {string | null} formatted date in the format of MMM dd, yyyy
 * @description Returns date in the formatted format
 * @param {Date | string} date
 * @example renderFormattedDate("2024-01-01") // Jan 01, 2024
 */
export const renderFormattedDate = (date: string | Date | undefined | null): string | null => {
  // Parse the date to check if it is valid
  const parsedDate = getDate(date);
  // return if undefined
  if (!parsedDate) return null;
  // Check if the parsed date is valid before formatting
  if (!isValid(parsedDate)) return null; // Return null for invalid dates
  // Format the date in format (MMM dd, yyyy) — or day-first for Jalali
  const formattedDate = activeFormat(parsedDate, jalaliFormatToken("MMM dd, yyyy")); // [FA-CUSTOM] calendar-aware
  return formattedDate;
};
