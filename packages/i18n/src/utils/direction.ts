/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// [FA-CUSTOM] Text direction primitives. Direction is a user preference,
// not derived from locale: a fa user defaults to LTR until they opt into RTL.

export type TDirection = "ltr" | "rtl";

export const DEFAULT_DIRECTION: TDirection = "ltr";

export const isValidDirection = (value: unknown): value is TDirection => value === "ltr" || value === "rtl";
