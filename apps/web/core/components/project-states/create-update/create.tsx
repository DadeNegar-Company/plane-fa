/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { STATE_GROUPS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IState, TStateGroups, TStateOperationsCallbacks } from "@plane/types";
// components
import { StateForm } from "@/components/project-states";

type TStateCreate = {
  groupKey: TStateGroups;
  shouldTrackEvents?: boolean;
  createStateCallback: TStateOperationsCallbacks["createState"];
  handleClose: () => void;
};

export const StateCreate = observer(function StateCreate(props: TStateCreate) {
  const { groupKey, createStateCallback, handleClose } = props;

  // states
  const [loader, setLoader] = useState(false);
  const { t } = useTranslation();

  const onCancel = () => {
    setLoader(false);
    handleClose();
  };

  const onSubmit = async (formData: Partial<IState>) => {
    if (!groupKey) return { status: "error" };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await createStateCallback({ ...formData, group: groupKey });

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("common.success"),
        message: t("project_states_extra.create_success"),
      });
      handleClose();
      return { status: "success" };
    } catch (error) {
      const errorStatus = error as { status: number; data: { error: string } };
      if (errorStatus?.status === 400) {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          message: "State with that name already exists. Please try again with another name.",
        });
        return { status: "already_exists" };
      } else {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("common.error.label"),
          message: errorStatus.data.error ?? t("project_states_extra.create_failed"),
        });
        return { status: "error" };
      }
    }
  };

  return (
    <StateForm
      data={{ name: "", description: "", color: STATE_GROUPS[groupKey].color }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonDisabled={loader}
      buttonTitle={loader ? `Creating` : `Create`}
    />
  );
});
