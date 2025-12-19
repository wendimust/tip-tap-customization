"use client";
import { useEffect, useState } from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { LineHeightIcon } from "@/components/tiptap-icons/line-height-icon";

// --- Tiptap UI ---
import {
  isLineHeightActive,
  canToggle,
  getActiveLineHeight,
  normalizeLineHeightOption,
  DEFAULT_LINE_HEIGHTS,
  shouldShowButton,
} from "@/components/tiptap-ui/line-height-button";

/**
 * Gets the currently active line-height option from the available options
 */
export function getActiveLineHeightOption(
  editor,
  lineHeights = DEFAULT_LINE_HEIGHTS
) {
  if (!editor || !editor.isEditable) return undefined;

  const active = getActiveLineHeight(editor);
  if (active == null) return undefined;

  const normalized = (lineHeights ?? DEFAULT_LINE_HEIGHTS)
    .map(normalizeLineHeightOption)
    .filter((option) => option.value != null);

  return (
    normalized.find((option) => Number(option.value) === Number(active)) ??
    undefined
  );
}

/**
 * Custom hook that provides line-height dropdown menu functionality for Tiptap editor
 */
export function useLineHeightDropdownMenu(config) {
  const {
    editor: providedEditor,
    lineHeights = DEFAULT_LINE_HEIGHTS,
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const activeOption = getActiveLineHeightOption(editor, lineHeights);
  const isActive = isLineHeightActive(editor, activeOption?.value);
  const canToggleState = canToggle(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable }) &&
          Boolean(lineHeights?.length)
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, lineHeights]);

  return {
    isVisible,
    activeOption,
    isActive,
    canToggle: canToggleState,
    lineHeights,
    label: "Line Height",
    Icon: LineHeightIcon,
  };
}
