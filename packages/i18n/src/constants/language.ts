/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TLanguage, ILanguageOption } from "../types";

// [FA-CUSTOM] Default to Persian for unauthenticated pages and post-logout state
export const FALLBACK_LANGUAGE: TLanguage = "fa";

export const SUPPORTED_LANGUAGES: ILanguageOption[] = [
  { label: "English", value: "en" },
  { label: "فارسی", value: "fa" },
];

/**
 * Enum for translation file names
 * These are the JSON files that contain translations each category
 */
export enum ETranslationFiles {
  TRANSLATIONS = "translations",
  ACCESSIBILITY = "accessibility",
  EDITOR = "editor",
  EMPTY_STATE = "empty-state",
}

export const LANGUAGE_STORAGE_KEY = "userLanguage";
