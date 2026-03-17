/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { CloseIcon } from "@plane/propel/icons";
// hooks
import { useLabel } from "@/hooks/store/use-label";

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
  editable: boolean | undefined;
};

export const AppliedLabelsFilters = observer(function AppliedLabelsFilters(props: Props) {
  const { handleRemove, values, editable } = props;
  // store hooks
  const { getLabelById } = useLabel();

  return (
    <>
      {values.map((labelId) => {
        const labelDetails = getLabelById(labelId);

        if (!labelDetails) return null;

        return (
          <div key={labelId} className="flex items-center gap-1 rounded-sm bg-layer-1 p-1 text-11">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: labelDetails.color }} />
            <span className="normal-case">{labelDetails.name}</span>
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemove(labelId)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
