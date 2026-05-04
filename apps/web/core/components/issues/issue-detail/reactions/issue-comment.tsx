/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { stringToEmoji } from "@plane/propel/emoji-icon-picker";
import { EmojiReactionGroup, EmojiReactionPicker } from "@plane/propel/emoji-reaction";
import type { EmojiReactionType } from "@plane/propel/emoji-reaction";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IUser } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useMember } from "@/hooks/store/use-member";

export type TIssueCommentReaction = {
  workspaceSlug: string;
  projectId: string;
  commentId: string;
  currentUser: IUser;
  disabled?: boolean;
};

export const IssueCommentReaction = observer(function IssueCommentReaction(props: TIssueCommentReaction) {
  const { workspaceSlug, projectId, commentId, currentUser, disabled = false } = props;
  // state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // hooks
  const {
    commentReaction: { getCommentReactionsByCommentId, commentReactionsByUser, getCommentReactionById },
    createCommentReaction,
    removeCommentReaction,
  } = useIssueDetail();
  const { getUserDetails } = useMember();
  const { t } = useTranslation();

  const reactionIds = getCommentReactionsByCommentId(commentId);
  const userReactions = commentReactionsByUser(commentId, currentUser.id).map((r) => r.reaction);

  const issueCommentReactionOperations = useMemo(
    () => ({
      create: async (reaction: string) => {
        try {
          if (!workspaceSlug || !projectId || !commentId) throw new Error("Missing fields");
          await createCommentReaction(workspaceSlug, projectId, commentId, reaction);
          setToast({
            title: t("common.success"),
            type: TOAST_TYPE.SUCCESS,
            message: t("toasts.reaction.created"),
          });
        } catch (_error) {
          setToast({
            title: t("common.error.label"),
            type: TOAST_TYPE.ERROR,
            message: t("toasts.reaction.created_failed"),
          });
        }
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      remove: async (reaction: string) => {
        try {
          if (!workspaceSlug || !projectId || !commentId || !currentUser?.id) throw new Error("Missing fields");
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          removeCommentReaction(workspaceSlug, projectId, commentId, reaction, currentUser.id);
          setToast({
            title: t("common.success"),
            type: TOAST_TYPE.SUCCESS,
            message: t("toasts.reaction.removed"),
          });
        } catch (_error) {
          setToast({
            title: t("common.error.label"),
            type: TOAST_TYPE.ERROR,
            message: t("toasts.reaction.removed_failed"),
          });
        }
      },
      react: async (reaction: string) => {
        if (userReactions.includes(reaction)) await issueCommentReactionOperations.remove(reaction);
        else await issueCommentReactionOperations.create(reaction);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaceSlug, projectId, commentId, currentUser, createCommentReaction, removeCommentReaction, userReactions]
  );

  const getReactionUsers = (reaction: string): string[] => {
    const reactionUsers = (reactionIds?.[reaction] || [])
      .map((reactionId) => {
        const reactionDetails = getCommentReactionById(reactionId);
        return reactionDetails
          ? getUserDetails(reactionDetails?.actor)?.display_name || reactionDetails?.display_name
          : null;
      })
      .filter((displayName): displayName is string => !!displayName);
    return reactionUsers;
  };

  // Transform reactions data to Propel EmojiReactionType format
  const reactions: EmojiReactionType[] = useMemo(() => {
    if (!reactionIds) return [];

    return Object.keys(reactionIds)
      .filter((reaction) => reactionIds[reaction]?.length > 0)
      .map((reaction) => ({
        emoji: stringToEmoji(reaction),
        count: reactionIds[reaction].length,
        reacted: userReactions.includes(reaction),
        users: getReactionUsers(reaction),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionIds, userReactions]);

  const handleReactionClick = (emoji: string) => {
    if (disabled) return;
    // Convert emoji back to decimal string format for the API
    const emojiCodePoints = Array.from(emoji).map((char) => char.codePointAt(0));
    const reactionString = emojiCodePoints.join("-");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    issueCommentReactionOperations.react(reactionString);
  };

  const handleEmojiSelect = (emoji: string) => {
    // emoji is already in decimal string format from EmojiReactionPicker
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    issueCommentReactionOperations.react(emoji);
  };

  return (
    <div className="relative mt-4">
      <EmojiReactionPicker
        isOpen={isPickerOpen}
        handleToggle={setIsPickerOpen}
        onChange={handleEmojiSelect}
        disabled={disabled}
        label={
          <EmojiReactionGroup
            reactions={reactions}
            onReactionClick={handleReactionClick}
            showAddButton={!disabled}
            onAddReaction={() => setIsPickerOpen(true)}
          />
        }
        placement="bottom-start"
      />
    </div>
  );
});
