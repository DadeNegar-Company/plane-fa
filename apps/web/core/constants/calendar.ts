/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TCalendarLayouts } from "@plane/types";
import { EStartOfTheWeek } from "@plane/types";
import { getCalendarSystem, getDateLocaleLanguage } from "@plane/utils"; // [FA-CUSTOM] calendar+language-aware month list

export const MONTHS_LIST: {
  [monthNumber: number]: {
    shortTitle: string;
    title: string;
  };
} = {
  1: {
    shortTitle: "Jan",
    title: "January",
  },
  2: {
    shortTitle: "Feb",
    title: "February",
  },
  3: {
    shortTitle: "Mar",
    title: "March",
  },
  4: {
    shortTitle: "Apr",
    title: "April",
  },
  5: {
    shortTitle: "May",
    title: "May",
  },
  6: {
    shortTitle: "Jun",
    title: "June",
  },
  7: {
    shortTitle: "Jul",
    title: "July",
  },
  8: {
    shortTitle: "Aug",
    title: "August",
  },
  9: {
    shortTitle: "Sep",
    title: "September",
  },
  10: {
    shortTitle: "Oct",
    title: "October",
  },
  11: {
    shortTitle: "Nov",
    title: "November",
  },
  12: {
    shortTitle: "Dec",
    title: "December",
  },
};

// [FA-CUSTOM] Jalali month names in English (1-indexed, same shape as MONTHS_LIST)
export const JALALI_MONTHS_LIST: {
  [monthNumber: number]: {
    shortTitle: string;
    title: string;
  };
} = {
  1: { shortTitle: "Far", title: "Farvardin" },
  2: { shortTitle: "Ord", title: "Ordibehesht" },
  3: { shortTitle: "Kho", title: "Khordad" },
  4: { shortTitle: "Tir", title: "Tir" },
  5: { shortTitle: "Mor", title: "Mordad" },
  6: { shortTitle: "Sha", title: "Shahrivar" },
  7: { shortTitle: "Meh", title: "Mehr" },
  8: { shortTitle: "Aba", title: "Aban" },
  9: { shortTitle: "Aza", title: "Azar" },
  10: { shortTitle: "Dey", title: "Dey" },
  11: { shortTitle: "Bah", title: "Bahman" },
  12: { shortTitle: "Esf", title: "Esfand" },
};

// [FA-CUSTOM] Gregorian month names in Persian script (for language=fa + Gregorian calendar)
export const MONTHS_LIST_FA: typeof MONTHS_LIST = {
  1: { shortTitle: "ژانویه", title: "ژانویه" },
  2: { shortTitle: "فوریه", title: "فوریه" },
  3: { shortTitle: "مارس", title: "مارس" },
  4: { shortTitle: "آوریل", title: "آوریل" },
  5: { shortTitle: "مه", title: "مه" },
  6: { shortTitle: "ژوئن", title: "ژوئن" },
  7: { shortTitle: "ژوئیه", title: "ژوئیه" },
  8: { shortTitle: "اوت", title: "اوت" },
  9: { shortTitle: "سپتامبر", title: "سپتامبر" },
  10: { shortTitle: "اکتبر", title: "اکتبر" },
  11: { shortTitle: "نوامبر", title: "نوامبر" },
  12: { shortTitle: "دسامبر", title: "دسامبر" },
};

// [FA-CUSTOM] Jalali month names in Persian script (for language=fa + Jalali calendar)
export const JALALI_MONTHS_LIST_FA: typeof JALALI_MONTHS_LIST = {
  1: { shortTitle: "فرو", title: "فروردین" },
  2: { shortTitle: "ارد", title: "اردیبهشت" },
  3: { shortTitle: "خرد", title: "خرداد" },
  4: { shortTitle: "تیر", title: "تیر" },
  5: { shortTitle: "مرد", title: "مرداد" },
  6: { shortTitle: "شهر", title: "شهریور" },
  7: { shortTitle: "مهر", title: "مهر" },
  8: { shortTitle: "آبا", title: "آبان" },
  9: { shortTitle: "آذر", title: "آذر" },
  10: { shortTitle: "دی", title: "دی" },
  11: { shortTitle: "بهم", title: "بهمن" },
  12: { shortTitle: "اسف", title: "اسفند" },
};

/**
 * [FA-CUSTOM] Returns the month-name map matching BOTH the active calendar system
 * and the active UI language:
 *   jalali + fa → JALALI_MONTHS_LIST_FA ("فروردین")   jalali + en → JALALI_MONTHS_LIST ("Farvardin")
 *   gregorian + fa → MONTHS_LIST_FA ("ژانویه")        gregorian + en → MONTHS_LIST ("January")
 * Use this everywhere a month name is rendered so the Calendar/Gantt views match
 * the rest of the date-display layer (see @plane/utils datetime helpers).
 */
export const getActiveMonthsList = (): typeof MONTHS_LIST => {
  const isJalali = getCalendarSystem() === "jalali";
  const isFa = getDateLocaleLanguage() === "fa";
  if (isJalali) return isFa ? JALALI_MONTHS_LIST_FA : JALALI_MONTHS_LIST;
  return isFa ? MONTHS_LIST_FA : MONTHS_LIST;
};

export const DAYS_LIST: {
  [dayIndex: number]: {
    shortTitle: string;
    title: string;
    value: EStartOfTheWeek;
  };
} = {
  1: {
    shortTitle: "Sun",
    title: "Sunday",
    value: EStartOfTheWeek.SUNDAY,
  },
  2: {
    shortTitle: "Mon",
    title: "Monday",
    value: EStartOfTheWeek.MONDAY,
  },
  3: {
    shortTitle: "Tue",
    title: "Tuesday",
    value: EStartOfTheWeek.TUESDAY,
  },
  4: {
    shortTitle: "Wed",
    title: "Wednesday",
    value: EStartOfTheWeek.WEDNESDAY,
  },
  5: {
    shortTitle: "Thu",
    title: "Thursday",
    value: EStartOfTheWeek.THURSDAY,
  },
  6: {
    shortTitle: "Fri",
    title: "Friday",
    value: EStartOfTheWeek.FRIDAY,
  },
  7: {
    shortTitle: "Sat",
    title: "Saturday",
    value: EStartOfTheWeek.SATURDAY,
  },
};

export const CALENDAR_LAYOUTS: {
  [layout in TCalendarLayouts]: {
    key: TCalendarLayouts;
    title: string;
  };
} = {
  month: {
    key: "month",
    title: "Month layout",
  },
  week: {
    key: "week",
    title: "Week layout",
  },
};
