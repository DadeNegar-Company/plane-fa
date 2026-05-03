/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { TriangleAlert } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";

type Props = {
  className?: string;
  onDismiss?: () => void;
};

export function ContentLimitBanner({ className, onDismiss }: Props) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex items-center gap-2 bg-layer-2 border-b border-subtle-1 px-4 py-2.5 text-sm", className)}>
      <div className="flex items-center gap-2 text-secondary mx-auto">
        <span className="text-amber-500">
          <TriangleAlert />
        </span>
        <span className="font-medium">{t("common.content_limit_reached")}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto text-placeholder hover:text-secondary"
          aria-label={t("common.dismiss_content_limit_warning")}
        >
          ✕
        </button>
      )}
    </div>
  );
}
