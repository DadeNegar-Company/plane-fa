/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Download } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import type { IExportData } from "@plane/types";
import { getDate, getFileURL, renderFormattedDate } from "@plane/utils";

type RowData = IExportData;
const checkExpiry = (inputDateString: string) => {
  const currentDate = new Date();
  const expiryDate = getDate(inputDateString);
  if (!expiryDate) return false;
  expiryDate.setDate(expiryDate.getDate() + 7);
  return expiryDate > currentDate;
};
export const useExportColumns = () => {
  const { t } = useTranslation();
  const columns = [
    {
      key: "Exported By",
      content: t("exporter_extra.exported_by"),
      tdRender: (rowData: RowData) => {
        const { avatar_url, display_name, email } = rowData.initiated_by_detail;
        return (
          <div className="flex items-center gap-x-2">
            <div>
              {avatar_url && avatar_url.trim() !== "" ? (
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full capitalize text-on-color">
                  <img
                    src={getFileURL(avatar_url)}
                    className="absolute start-0 top-0 h-full w-full rounded-full object-cover"
                    alt={display_name || email}
                  />
                </span>
              ) : (
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 capitalize text-on-color text-11">
                  {(email ?? display_name ?? "?")[0]}
                </span>
              )}
            </div>
            <div>{display_name}</div>
          </div>
        );
      },
    },
    {
      key: "Exported On",
      content: t("exporter_extra.exported_on"),
      tdRender: (rowData: RowData) => <span>{renderFormattedDate(rowData.created_at)}</span>,
    },

    {
      key: "Exported projects",
      content: t("exporter_extra.exported_projects"),
      tdRender: (rowData: RowData) => <div className="text-13">{rowData.project.length} project(s)</div>,
    },
    {
      key: "Format",
      content: t("exporter_extra.format"),
      tdRender: (rowData: RowData) => (
        <span className="text-13">
          {rowData.provider === "csv"
            ? "CSV"
            : rowData.provider === "xlsx"
              ? "Excel"
              : rowData.provider === "json"
                ? "JSON"
                : ""}
        </span>
      ),
    },
    {
      key: "Status",
      content: t("exporter_extra.status"),
      tdRender: (rowData: RowData) => (
        <span
          className={`rounded-sm text-11 px-2 py-1 capitalize ${
            rowData.status === "completed"
              ? "bg-success-subtle text-success-primary"
              : rowData.status === "processing"
                ? "bg-yellow-500/20 text-yellow-500"
                : rowData.status === "failed"
                  ? "bg-danger-subtle text-danger-primary"
                  : rowData.status === "expired"
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-gray-500/20 text-gray-500"
          }`}
        >
          {rowData.status}
        </span>
      ),
    },
    {
      key: "Download",
      content: t("exporter_extra.download"),
      tdRender: (rowData: RowData) =>
        checkExpiry(rowData.created_at) ? (
          <>
            {rowData.status == "completed" ? (
              <a target="_blank" href={rowData?.url} rel="noopener noreferrer">
                <button className="w-full flex items-center gap-1 text-accent-primary font-medium">
                  <Download className="h-4 w-4" />
                  <div>{t("exporter_extra.download")}</div>
                </button>
              </a>
            ) : (
              "-"
            )}
          </>
        ) : (
          <div className="text-11 text-danger-primary">{t("exporter_extra.expired")}</div>
        ),
    },
  ];
  return columns;
};
