/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// types
import type { WeekMonthDataType, ChartDataType, TGanttViews } from "@plane/types";
import { EStartOfTheWeek } from "@plane/types";
// [FA-CUSTOM] Jalali calendar support
import { getCalendarSystem, getDateLocaleLanguage } from "@plane/utils";
import { getYear as jalaliGetYear, getMonth as jalaliGetMonth, getDate as jalaliGetDate } from "date-fns-jalali";

// constants
export const generateWeeks = (startOfWeek: EStartOfTheWeek = EStartOfTheWeek.SATURDAY): WeekMonthDataType[] => [
  ...weeks.slice(startOfWeek),
  ...weeks.slice(0, startOfWeek),
];

export const weeks: WeekMonthDataType[] = [
  { key: 0, shortTitle: "sun", title: "sunday", abbreviation: "Su" },
  { key: 1, shortTitle: "mon", title: "monday", abbreviation: "M" },
  { key: 2, shortTitle: "tue", title: "tuesday", abbreviation: "T" },
  { key: 3, shortTitle: "wed", title: "wednesday", abbreviation: "W" },
  { key: 4, shortTitle: "thurs", title: "thursday", abbreviation: "Th" },
  { key: 5, shortTitle: "fri", title: "friday", abbreviation: "F" },
  { key: 6, shortTitle: "sat", title: "saturday", abbreviation: "Sa" },
];

export const months: WeekMonthDataType[] = [
  { key: 0, shortTitle: "jan", title: "january", abbreviation: "Jan" },
  { key: 1, shortTitle: "feb", title: "february", abbreviation: "Feb" },
  { key: 2, shortTitle: "mar", title: "march", abbreviation: "Mar" },
  { key: 3, shortTitle: "apr", title: "april", abbreviation: "Apr" },
  { key: 4, shortTitle: "may", title: "may", abbreviation: "May" },
  { key: 5, shortTitle: "jun", title: "june", abbreviation: "Jun" },
  { key: 6, shortTitle: "jul", title: "july", abbreviation: "Jul" },
  { key: 7, shortTitle: "aug", title: "august", abbreviation: "Aug" },
  { key: 8, shortTitle: "sept", title: "september", abbreviation: "Sept" },
  { key: 9, shortTitle: "oct", title: "october", abbreviation: "Oct" },
  { key: 10, shortTitle: "nov", title: "november", abbreviation: "Nov" },
  { key: 11, shortTitle: "dec", title: "december", abbreviation: "Dec" },
];

export const quarters: WeekMonthDataType[] = [
  { key: 0, shortTitle: "Q1", title: "Jan - Mar", abbreviation: "Q1" },
  { key: 1, shortTitle: "Q2", title: "Apr - Jun", abbreviation: "Q2" },
  { key: 2, shortTitle: "Q3", title: "Jul - Sept", abbreviation: "Q3" },
  { key: 3, shortTitle: "Q4", title: "Oct - Dec", abbreviation: "Q4" },
];

// [FA-CUSTOM] Jalali month and quarter constants (English)
export const jalaliMonths: WeekMonthDataType[] = [
  { key: 0, shortTitle: "far", title: "Farvardin", abbreviation: "Far" },
  { key: 1, shortTitle: "ord", title: "Ordibehesht", abbreviation: "Ord" },
  { key: 2, shortTitle: "kho", title: "Khordad", abbreviation: "Kho" },
  { key: 3, shortTitle: "tir", title: "Tir", abbreviation: "Tir" },
  { key: 4, shortTitle: "mor", title: "Mordad", abbreviation: "Mor" },
  { key: 5, shortTitle: "sha", title: "Shahrivar", abbreviation: "Sha" },
  { key: 6, shortTitle: "meh", title: "Mehr", abbreviation: "Meh" },
  { key: 7, shortTitle: "aba", title: "Aban", abbreviation: "Aba" },
  { key: 8, shortTitle: "aza", title: "Azar", abbreviation: "Aza" },
  { key: 9, shortTitle: "dey", title: "Dey", abbreviation: "Dey" },
  { key: 10, shortTitle: "bah", title: "Bahman", abbreviation: "Bah" },
  { key: 11, shortTitle: "esf", title: "Esfand", abbreviation: "Esf" },
];

export const jalaliQuarters: WeekMonthDataType[] = [
  { key: 0, shortTitle: "Q1", title: "Far - Kho", abbreviation: "Q1" },
  { key: 1, shortTitle: "Q2", title: "Tir - Sha", abbreviation: "Q2" },
  { key: 2, shortTitle: "Q3", title: "Meh - Aza", abbreviation: "Q3" },
  { key: 3, shortTitle: "Q4", title: "Dey - Esf", abbreviation: "Q4" },
];

// [FA-CUSTOM] Persian-script variants (for language=fa). Same shape/keys as above.
export const monthsFa: WeekMonthDataType[] = [
  { key: 0, shortTitle: "ژانویه", title: "ژانویه", abbreviation: "ژانویه" },
  { key: 1, shortTitle: "فوریه", title: "فوریه", abbreviation: "فوریه" },
  { key: 2, shortTitle: "مارس", title: "مارس", abbreviation: "مارس" },
  { key: 3, shortTitle: "آوریل", title: "آوریل", abbreviation: "آوریل" },
  { key: 4, shortTitle: "مه", title: "مه", abbreviation: "مه" },
  { key: 5, shortTitle: "ژوئن", title: "ژوئن", abbreviation: "ژوئن" },
  { key: 6, shortTitle: "ژوئیه", title: "ژوئیه", abbreviation: "ژوئیه" },
  { key: 7, shortTitle: "اوت", title: "اوت", abbreviation: "اوت" },
  { key: 8, shortTitle: "سپتامبر", title: "سپتامبر", abbreviation: "سپتامبر" },
  { key: 9, shortTitle: "اکتبر", title: "اکتبر", abbreviation: "اکتبر" },
  { key: 10, shortTitle: "نوامبر", title: "نوامبر", abbreviation: "نوامبر" },
  { key: 11, shortTitle: "دسامبر", title: "دسامبر", abbreviation: "دسامبر" },
];

export const jalaliMonthsFa: WeekMonthDataType[] = [
  { key: 0, shortTitle: "فرو", title: "فروردین", abbreviation: "فرو" },
  { key: 1, shortTitle: "ارد", title: "اردیبهشت", abbreviation: "ارد" },
  { key: 2, shortTitle: "خرد", title: "خرداد", abbreviation: "خرد" },
  { key: 3, shortTitle: "تیر", title: "تیر", abbreviation: "تیر" },
  { key: 4, shortTitle: "مرد", title: "مرداد", abbreviation: "مرد" },
  { key: 5, shortTitle: "شهر", title: "شهریور", abbreviation: "شهر" },
  { key: 6, shortTitle: "مهر", title: "مهر", abbreviation: "مهر" },
  { key: 7, shortTitle: "آبا", title: "آبان", abbreviation: "آبا" },
  { key: 8, shortTitle: "آذر", title: "آذر", abbreviation: "آذر" },
  { key: 9, shortTitle: "دی", title: "دی", abbreviation: "دی" },
  { key: 10, shortTitle: "بهم", title: "بهمن", abbreviation: "بهم" },
  { key: 11, shortTitle: "اسف", title: "اسفند", abbreviation: "اسف" },
];

export const quartersFa: WeekMonthDataType[] = [
  { key: 0, shortTitle: "Q1", title: "ژانویه - مارس", abbreviation: "Q1" },
  { key: 1, shortTitle: "Q2", title: "آوریل - ژوئن", abbreviation: "Q2" },
  { key: 2, shortTitle: "Q3", title: "ژوئیه - سپتامبر", abbreviation: "Q3" },
  { key: 3, shortTitle: "Q4", title: "اکتبر - دسامبر", abbreviation: "Q4" },
];

export const jalaliQuartersFa: WeekMonthDataType[] = [
  { key: 0, shortTitle: "Q1", title: "فروردین - خرداد", abbreviation: "Q1" },
  { key: 1, shortTitle: "Q2", title: "تیر - شهریور", abbreviation: "Q2" },
  { key: 2, shortTitle: "Q3", title: "مهر - آذر", abbreviation: "Q3" },
  { key: 3, shortTitle: "Q4", title: "دی - اسفند", abbreviation: "Q4" },
];

/** [FA-CUSTOM] Months array matching BOTH the active calendar system and UI language */
export const getActiveMonths = (): WeekMonthDataType[] => {
  const isJalali = getCalendarSystem() === "jalali";
  const isFa = getDateLocaleLanguage() === "fa";
  if (isJalali) return isFa ? jalaliMonthsFa : jalaliMonths;
  return isFa ? monthsFa : months;
};

/** [FA-CUSTOM] Quarters array matching BOTH the active calendar system and UI language */
export const getActiveQuarters = (): WeekMonthDataType[] => {
  const isJalali = getCalendarSystem() === "jalali";
  const isFa = getDateLocaleLanguage() === "fa";
  if (isJalali) return isFa ? jalaliQuartersFa : jalaliQuarters;
  return isFa ? quartersFa : quarters;
};

export const charCapitalize = (word: string) => `${word.charAt(0).toUpperCase()}${word.substring(1)}`;

export const bindZero = (value: number) => (value > 9 ? `${value}` : `0${value}`);

export const timePreview = (date: Date) => {
  let hours = date.getHours();
  const amPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  let minutes: number | string = date.getMinutes();
  minutes = bindZero(minutes);

  return `${bindZero(hours)}:${minutes} ${amPm}`;
};

export const datePreview = (date: Date, includeTime: boolean = false) => {
  // [FA-CUSTOM] Calendar-aware date preview
  const isJalali = getCalendarSystem() === "jalali";
  const day = isJalali ? jalaliGetDate(date) : date.getDate();
  const monthIndex = isJalali ? jalaliGetMonth(date) : date.getMonth();
  const activeMonthList = isJalali ? jalaliMonths : months;
  const month = activeMonthList[monthIndex];
  const year = isJalali ? jalaliGetYear(date) : date.getFullYear();

  const monthLabel = isJalali ? (month?.title ?? "") : charCapitalize(month?.shortTitle ?? "");
  return `${monthLabel} ${day}, ${year}${includeTime ? `, ${timePreview(date)}` : ``}`;
};

// context data
export const VIEWS_LIST: ChartDataType[] = [
  {
    key: "week",
    i18n_title: "common.week",
    data: {
      startDate: new Date(),
      currentDate: new Date(),
      endDate: new Date(),
      approxFilterRange: 4, // it will preview week dates with weekends highlighted with 1 week limitations ex: title (Wed 1, Thu 2, Fri 3)
      dayWidth: 60,
    },
  },
  {
    key: "month",
    i18n_title: "common.month",
    data: {
      startDate: new Date(),
      currentDate: new Date(),
      endDate: new Date(),
      approxFilterRange: 6, // it will preview monthly all dates with weekends highlighted with no limitations ex: title (1, 2, 3)
      dayWidth: 20,
    },
  },
  {
    key: "quarter",
    i18n_title: "common.quarter",
    data: {
      startDate: new Date(),
      currentDate: new Date(),
      endDate: new Date(),
      approxFilterRange: 24, // it will preview week starting dates all months data and there is 3 months limitation for preview ex: title (2, 9, 16, 23, 30)
      dayWidth: 5,
    },
  },
];

export const currentViewDataWithView = (view: TGanttViews = "month") =>
  VIEWS_LIST.find((_viewData) => _viewData.key === view);
