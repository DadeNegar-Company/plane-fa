/**
 * [FA-CUSTOM] Auto bidi text direction for rich text editor.
 * Detects RTL/LTR text and applies dir attribute per paragraph/heading.
 */
// eslint-disable-next-line import/no-named-as-default
import TextDirection from "tiptap-text-direction";

export const CustomTextDirectionExtension = TextDirection.configure({
  types: ["heading", "paragraph", "bulletList", "orderedList", "taskList"],
  defaultDirection: null,
});
