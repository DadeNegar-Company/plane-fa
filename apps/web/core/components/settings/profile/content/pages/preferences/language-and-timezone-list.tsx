/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// plane imports
import { SUPPORTED_LANGUAGES, useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { ECalendarSystem, ETextDirection } from "@plane/types"; // [FA-CUSTOM]
import { CustomSelect } from "@plane/ui";
// components
import { TimezoneSelect } from "@/components/global";
import { StartOfWeekPreference } from "@/components/profile/start-of-week-preference";
import { SettingsControlItem } from "@/components/settings/control-item";
// hooks
import { useUser, useUserProfile } from "@/hooks/store/user";

export const ProfileSettingsLanguageAndTimezonePreferencesList = observer(
  function ProfileSettingsLanguageAndTimezonePreferencesList() {
    // store hooks
    const {
      data: user,
      updateCurrentUser,
      userProfile: { data: profile },
    } = useUser();
    const { updateUserProfile } = useUserProfile();
    // translation
    const { t } = useTranslation();

    const handleTimezoneChange = async (value: string) => {
      try {
        await updateCurrentUser({ user_timezone: value });
        setToast({
          title: t("common.success"),
          message: t("profile_preferences.timezone.success"),
          type: TOAST_TYPE.SUCCESS,
        });
      } catch (_error) {
        setToast({
          title: t("common.error.label"),
          message: t("profile_preferences.timezone.failed"),
          type: TOAST_TYPE.ERROR,
        });
      }
    };

    const handleLanguageChange = async (value: string) => {
      try {
        await updateUserProfile({ language: value });
        setToast({
          title: t("common.success"),
          message: t("profile_preferences.language.success"),
          type: TOAST_TYPE.SUCCESS,
        });
      } catch (_error) {
        setToast({
          title: t("common.error.label"),
          message: t("profile_preferences.language.failed"),
          type: TOAST_TYPE.ERROR,
        });
      }
    };

    const getLanguageLabel = (value: string) => {
      const selectedLanguage = SUPPORTED_LANGUAGES.find((l) => l.value === value);
      if (!selectedLanguage) return value;
      return selectedLanguage.label;
    };

    // [FA-CUSTOM] Text direction change handler. Persisting to the profile
    // triggers the store-wrapper effect that sets <html dir>, so the UI flips
    // immediately without a reload.
    const handleDirectionChange = async (value: string) => {
      try {
        await updateUserProfile({ text_direction: value as ETextDirection });
        setToast({
          title: t("common.success"),
          message: t("common.text_direction_updated"),
          type: TOAST_TYPE.SUCCESS,
        });
      } catch (_error) {
        setToast({
          title: t("common.error.label"),
          message: t("common.text_direction_update_failed"),
          type: TOAST_TYPE.ERROR,
        });
      }
    };

    const TEXT_DIRECTION_OPTIONS = [
      { value: ETextDirection.LTR, label: t("common.text_direction_ltr") },
      { value: ETextDirection.RTL, label: t("common.text_direction_rtl") },
    ];

    // [FA-CUSTOM] Calendar system change handler
    const handleCalendarSystemChange = async (value: string) => {
      try {
        await updateUserProfile({ calendar_system: value as ECalendarSystem });
        setToast({
          title: t("common.success"),
          message: t("profile_preferences.calendar.success"),
          type: TOAST_TYPE.SUCCESS,
        });
      } catch (_error) {
        setToast({
          title: t("common.error.label"),
          message: t("profile_preferences.calendar.failed"),
          type: TOAST_TYPE.ERROR,
        });
      }
    };

    const CALENDAR_SYSTEM_OPTIONS = [
      { value: ECalendarSystem.GREGORIAN, label: "Gregorian" },
      { value: ECalendarSystem.JALALI, label: "Jalali (Shamsi)" },
    ];

    return (
      <div className="flex flex-col gap-y-1">
        <SettingsControlItem
          title={t("timezone")}
          description={t("timezone_setting")}
          control={
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <TimezoneSelect value={user?.user_timezone || "Asia/Tehran"} onChange={handleTimezoneChange} />
          }
        />
        <SettingsControlItem
          title={t("language")}
          description={t("language_setting")}
          control={
            <CustomSelect
              value={profile?.language}
              label={profile?.language ? getLanguageLabel(profile?.language) : "Select a language"}
              onChange={handleLanguageChange}
              buttonClassName="border border-subtle-1"
              className="rounded-md"
              input
              placement="bottom-end"
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <CustomSelect.Option key={item.value} value={item.value}>
                  {item.label}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          }
        />
        {/* [FA-CUSTOM] Text direction selector - only shown when language is Persian.
            Default is LTR for everyone (including existing fa users) until they opt in. */}
        {profile?.language === "fa" && (
          <SettingsControlItem
            title={t("common.text_direction_title")}
            description={t("common.text_direction_description")}
            control={
              <CustomSelect
                value={profile?.text_direction ?? ETextDirection.LTR}
                label={
                  TEXT_DIRECTION_OPTIONS.find((o) => o.value === (profile?.text_direction ?? ETextDirection.LTR))?.label
                }
                onChange={handleDirectionChange}
                buttonClassName="border border-subtle-1"
                className="rounded-md"
                input
                placement="bottom-end"
              >
                {TEXT_DIRECTION_OPTIONS.map((item) => (
                  <CustomSelect.Option key={item.value} value={item.value}>
                    {item.label}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            }
          />
        )}
        <StartOfWeekPreference
          option={{
            title: "First day of the week",
            description: "This will change how all calendars in your app look.",
          }}
        />
        {/* [FA-CUSTOM] Calendar system selector */}
        <SettingsControlItem
          title={t("common.calendar_system")}
          description="Choose between Gregorian and Jalali (Shamsi) calendar for all dates."
          control={
            <CustomSelect
              value={profile?.calendar_system ?? ECalendarSystem.GREGORIAN}
              label={
                CALENDAR_SYSTEM_OPTIONS.find((o) => o.value === (profile?.calendar_system ?? ECalendarSystem.GREGORIAN))
                  ?.label ?? "Gregorian"
              }
              onChange={handleCalendarSystemChange}
              buttonClassName="border border-subtle-1"
              className="rounded-md"
              input
              placement="bottom-end"
            >
              {CALENDAR_SYSTEM_OPTIONS.map((item) => (
                <CustomSelect.Option key={item.value} value={item.value}>
                  {item.label}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          }
        />
      </div>
    );
  }
);
