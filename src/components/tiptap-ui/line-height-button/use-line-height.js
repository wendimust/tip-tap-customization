"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { LineHeightIcon } from "@/components/tiptap-icons/line-height-icon";

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils";

/**
 * Default line-height options used by the dropdown.
 * Values are unitless numbers passed directly to CSS `line-height`.
 */
export const DEFAULT_LINE_HEIGHTS = [
  { label: "1.0", value: 1.0 },
  { label: "1.5", value: 1.5 },
  { label: "2.0", value: 2.0 },
  { label: "2.5", value: 2.5 },
  { label: "3.0", value: 3.0 },
];

export const LINE_HEIGHT_SHORTCUT_KEYS = {
  "1.0": "ctrl+shift+1",
  "1.5": "ctrl+shift+2",
  "2.0": "ctrl+shift+3",
  "2.5": "ctrl+shift+4",
  "3.0": "ctrl+shift+5",
};

/**
 * Maps line-height values to the icon used in the UI.
 * Currently all levels share the same `LineHeightIcon`, but this is kept
 * extensible for future customization.
 */
export const lineHeightIcons = {
  "1.0": LineHeightIcon,
  "1.5": LineHeightIcon,
  "2.0": LineHeightIcon,
  "2.5": LineHeightIcon,
  "3.0": LineHeightIcon,
};

export function normalizeLineHeightOption(option) {
  if (!option) return { label: "Line height", value: null };

  if (typeof option === "number" || typeof option === "string") {
    const num = Number(option);
    if (Number.isNaN(num)) return { label: String(option), value: null };
    return { label: String(num), value: num };
  }

  const { label, value } = option;
  const resolvedValue = value ?? Number(label);

  return {
    label: label ?? String(resolvedValue ?? "Line height"),
    value: typeof resolvedValue === "number" ? resolvedValue : null,
  };
}

/**
 * Checks if line-height commands are available in the current editor state.
 * This relies on the `textStyle` mark and `toggleTextStyle` command being present.
 */
export function canToggle(editor) {
  if (!editor || !editor.isEditable) return false;

  return (
    isMarkInSchema("textStyle", editor) &&
    typeof editor.commands?.toggleTextStyle === "function"
  );
}

/**
 * Returns the currently active line-height from the `textStyle` mark.
 */
export function getActiveLineHeight(editor) {
  if (!editor || !editor.isEditable) return null;

  return editor.getAttributes("textStyle")?.lineHeight ?? null;
}

/**
 * Checks if a given line-height is currently active.
 */
export function isLineHeightActive(editor, lineHeight) {
  if (!editor || !editor.isEditable) return false;

  const active = getActiveLineHeight(editor);
  if (lineHeight == null) {
    return active != null;
  }

  return String(active) === String(lineHeight);
}

/**
 * Toggles (sets/unsets) the line-height on the current selection using
 * the `toggleTextStyle` command from `TextStyle` / `LineHeight`.
 */
export function toggleLineHeight(editor, lineHeight) {
  if (!editor || !editor.isEditable || lineHeight == null) return false;

  const value = String(lineHeight);
  return editor.chain().focus().toggleTextStyle({ lineHeight: value }).run();
}

/**
 * Determines if the line-height button should be shown.
 */
export function shouldShowButton(props) {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (hideWhenUnavailable) {
    return canToggle(editor);
  }

  return true;
}

/**
 * Custom hook that provides line-height functionality for the Tiptap editor.
 *
 * For most use-cases you'll want to use this via `LineHeightButton`
 * or `LineHeightDropdownMenu`.
 */
export function useLineHeight(config) {
  const {
    editor: providedEditor,
    level,
    lineHeight, // optional alias for clarity
    hideWhenUnavailable = false,
    onToggled,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const normalizedOption = useMemo(
    () => normalizeLineHeightOption(lineHeight ?? level),
    [lineHeight, level]
  );

  const targetLineHeight = normalizedOption.value;
  const canToggleState = canToggle(editor) && targetLineHeight != null;
  const isActive = isLineHeightActive(editor, targetLineHeight);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable }) &&
          targetLineHeight != null
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, targetLineHeight]);

  const handleToggle = useCallback(() => {
    if (!editor || targetLineHeight == null) return false;

    const success = toggleLineHeight(editor, targetLineHeight);
    if (success) {
      onToggled?.();
    }

    return success;
  }, [editor, onToggled, targetLineHeight]);

  const label = `Line height ${normalizedOption.label}`;
  const key = normalizedOption.label;

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label,
    lineHeight: targetLineHeight,
    shortcutKeys: LINE_HEIGHT_SHORTCUT_KEYS[key],
    Icon: lineHeightIcons[key] ?? LineHeightIcon,
  };
}
