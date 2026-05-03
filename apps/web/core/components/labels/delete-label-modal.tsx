/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// types
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IIssueLabel } from "@plane/types";
// ui
import { AlertModalCore } from "@plane/ui";
// hooks
import { useLabel } from "@/hooks/store/use-label";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: IIssueLabel | null;
};

export const DeleteLabelModal = observer(function DeleteLabelModal(props: Props) {
  const { isOpen, onClose, data } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { deleteLabel } = useLabel();
  const { t } = useTranslation();
  // states
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setIsDeleteLoading(false);
  };

  const handleDeletion = async () => {
    if (!workspaceSlug || !projectId || !data) return;

    setIsDeleteLoading(true);

    await deleteLabel(workspaceSlug.toString(), projectId.toString(), data.id)
      // eslint-disable-next-line promise/always-return
      .then(() => {
        handleClose();
      })
      .catch((err) => {
        setIsDeleteLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const error = err?.error || "Label could not be deleted. Please try again.";
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: error,
        });
      });
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      handleSubmit={handleDeletion}
      isSubmitting={isDeleteLoading}
      isOpen={isOpen}
      title={t("labels_extra.delete_title")}
      content={
        <>
          Are you sure you want to delete <span className="font-medium text-primary">{data?.name}</span>? This will
          remove the label from all the work item and from any views where the label is being filtered upon.
        </>
      }
    />
  );
});
