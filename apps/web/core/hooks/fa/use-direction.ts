/**
 * [FA-CUSTOM] Hook returning the user's chosen UI direction (ltr | rtl).
 * Falls back to LTR for anonymous users or when the profile hasn't loaded.
 */

import { DEFAULT_DIRECTION, type TDirection } from "@plane/i18n";
import { useUserProfile } from "@/hooks/store/user";

export const useDirection = (): TDirection => {
  const { data } = useUserProfile();
  return data?.text_direction ?? DEFAULT_DIRECTION;
};

export const useIsRTL = (): boolean => useDirection() === "rtl";
